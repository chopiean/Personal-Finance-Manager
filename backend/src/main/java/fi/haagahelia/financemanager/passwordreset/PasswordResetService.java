package fi.haagahelia.financemanager.passwordreset;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {

    static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);
    static final String INVALID_LINK = "This reset link is invalid or has expired. Please request a new one.";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetMailer mailer;
    private final PasswordEncoder passwordEncoder;
    private final String frontendUrl;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordResetMailer mailer,
                                PasswordEncoder passwordEncoder,
                                @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
                                Clock clock) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailer = mailer;
        this.passwordEncoder = passwordEncoder;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.clock = clock;
    }

    /**
     * Emails a reset link if the identifier matches an account. Does nothing
     * otherwise, so callers can't tell which accounts exist.
     */
    @Transactional
    public void requestReset(String identifier) {
        String id = identifier.trim();
        userRepository.findByUsernameOrEmail(id, id).ifPresent(user -> {
            // Only the newest link works
            tokenRepository.deleteByUserId(user.getId());

            byte[] bytes = new byte[32];
            random.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            tokenRepository.save(new PasswordResetToken(
                    hash(token), user, Instant.now(clock).plus(TOKEN_LIFETIME)));

            String link = frontendUrl + "/reset-password?token=" + token;
            mailer.sendResetLink(user.getEmail(), user.getUsername(), link, TOKEN_LIFETIME.toMinutes());
        });
    }

    /** Sets a new password. The token is single-use and time-limited. */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken stored = tokenRepository.findByTokenHash(hash(token))
                .orElseThrow(() -> new InvalidResetTokenException(INVALID_LINK));

        User user = stored.getUser();
        if (stored.isExpired(Instant.now(clock))) {
            tokenRepository.deleteByUserId(user.getId());
            throw new InvalidResetTokenException(INVALID_LINK);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId());
    }

    static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
