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

        Claims claims = Jwts.parserBuilder()             // ✔ works on old jjwt
                .setSigningKey(getSignInKey())           // ✔ correct API
                .build()
                .parseClaimsJws(token)                   // ✔ correct API
                .getBody();

        return resolver.apply(claims);
    }

    // --------------------------------------
    // TOKEN GENERATION  (Railway-compatible)
    // --------------------------------------

    public String generateToken(UserDetails userDetails) {
        long now = System.currentTimeMillis();
        long expiration = now + (1000 * 60 * 60 * 24); // 24 hours

        return Jwts.builder()
                .setSubject(userDetails.getUsername())        // ✔ old API
                .setIssuedAt(new Date(now))                   // ✔ old API
                .setExpiration(new Date(expiration))          // ✔ old API
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // ✔ old API
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
