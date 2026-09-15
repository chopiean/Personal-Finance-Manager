package fi.haagahelia.financemanager.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET_KEY =
            "unit-test-jwt-secret-key-at-least-32-bytes-long";

    private final JwtService jwtService = new JwtService();

    {
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
    }

    private UserDetails userDetails(String username) {
        return User.withUsername(username).password("pw").roles("USER").build();
    }

    @Test
    void generateToken_thenExtractUsername_roundTrips() {
        UserDetails user = userDetails("jdoe");

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("jdoe");
    }

    @Test
    void isTokenValid_returnsTrue_forMatchingUserAndUnexpiredToken() {
        UserDetails user = userDetails("jdoe");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalse_forDifferentUser() {
        UserDetails user = userDetails("jdoe");
        String token = jwtService.generateToken(user);

        UserDetails otherUser = userDetails("someoneelse");

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    void isTokenValid_returnsFalse_forExpiredToken() {
        Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        long now = System.currentTimeMillis();

        String expiredToken = Jwts.builder()
                .setSubject("jdoe")
                .setIssuedAt(new Date(now - 20_000))
                .setExpiration(new Date(now - 10_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        UserDetails user = userDetails("jdoe");

        assertThatThrownBy(() -> jwtService.isTokenValid(expiredToken, user))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void extractUsername_throws_forMalformedToken() {
        assertThatThrownBy(() -> jwtService.extractUsername("not-a-valid-jwt"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void extractUsername_throws_forTokenSignedWithDifferentKey() {
        Key otherKey = Keys.hmacShaKeyFor(
                "another-different-secret-key-at-least-32-bytes".getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .setSubject("jdoe")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 100_000))
                .signWith(otherKey, SignatureAlgorithm.HS256)
                .compact();

        assertThatThrownBy(() -> jwtService.extractUsername(token))
                .isInstanceOf(RuntimeException.class);
    }
}
