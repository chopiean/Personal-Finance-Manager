package fi.haagahelia.financemanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "dGhpc2lzbXktc2VjcmV0LXNpbXBsZS1qd3Qtc2VjcmV0LWF0LWxlYXN0MzJieXRlcw==";

    private Key getSignInKey() {
        byte[] decodedKey = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    // --------------------------------------
    // TOKEN EXTRACTION (works on jjwt 0.11.x)
    // --------------------------------------

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {

        Claims claims = Jwts.parserBuilder()            
                .setSigningKey(getSignInKey())           
                .build()
                .parseClaimsJws(token)                   
                .getBody();

        return resolver.apply(claims);
    }

    // --------------------------------------
    // TOKEN GENERATION  (Railway-compatible)
    // --------------------------------------

    public String generateToken(UserDetails userDetails) {
        long now = System.currentTimeMillis();
        long expiration = now + (1000 * 60 * 60 * 24); 

        return Jwts.builder()
                .setSubject(userDetails.getUsername())        
                .setIssuedAt(new Date(now))                   
                .setExpiration(new Date(expiration))         
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) 
                .compact();
    }

    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        Date exp = extractClaim(token, Claims::getExpiration);
        return exp.before(new Date());
    }
}
