package fi.haagahelia.financemanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
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
