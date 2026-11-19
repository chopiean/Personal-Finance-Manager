package fi.haagahelia.financemanager.passwordreset;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-19T12:00:00Z");

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private PasswordResetMailer mailer;
    @Mock private PasswordEncoder passwordEncoder;

    private PasswordResetService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new PasswordResetService(userRepository, tokenRepository, mailer,
                passwordEncoder, "https://app.example.com/", Clock.fixed(NOW, ZoneOffset.UTC));
        user = new User("jane", "jane@example.com", "old-hash", "ROLE_USER");
        ReflectionTestUtils.setField(user, "id", 7L);
    }

    @Test
    void requestReset_emailsLinkAndStoresOnlyTheHash() {
        when(userRepository.findByUsernameOrEmail("jane@example.com", "jane@example.com"))
                .thenReturn(Optional.of(user));

        service.requestReset("  jane@example.com ");

        ArgumentCaptor<String> link = ArgumentCaptor.forClass(String.class);
        verify(mailer).sendResetLink(eq("jane@example.com"), eq("jane"), link.capture(), eq(30L));
        assertThat(link.getValue()).startsWith("https://app.example.com/reset-password?token=");
        String token = link.getValue().substring(link.getValue().indexOf("token=") + 6);

        ArgumentCaptor<PasswordResetToken> saved = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).deleteByUserId(7L); // older links stop working
        verify(tokenRepository).save(saved.capture());
        assertThat(saved.getValue().getTokenHash())
                .isEqualTo(PasswordResetService.hash(token))
                .isNotEqualTo(token);
        assertThat(saved.getValue().getExpiresAt()).isEqualTo(NOW.plusSeconds(30 * 60));
    }

    @Test
    void requestReset_unknownAccount_doesNothing() {
        when(userRepository.findByUsernameOrEmail(any(), any())).thenReturn(Optional.empty());

        service.requestReset("nobody@example.com");

        verifyNoInteractions(mailer, tokenRepository);
    }

    @Test
    void resetPassword_validToken_updatesPasswordAndConsumesToken() {
        PasswordResetToken stored = new PasswordResetToken(
                PasswordResetService.hash("tok"), user, NOW.plusSeconds(60));
        when(tokenRepository.findByTokenHash(PasswordResetService.hash("tok")))
                .thenReturn(Optional.of(stored));
        when(passwordEncoder.encode("NewPass1!")).thenReturn("new-hash");

        service.resetPassword("tok", "NewPass1!");

        assertThat(user.getPassword()).isEqualTo("new-hash");
        verify(userRepository).save(user);
        verify(tokenRepository).deleteByUserId(7L);
    }

    @Test
    void resetPassword_expiredToken_isRejected() {
        PasswordResetToken stored = new PasswordResetToken(
                PasswordResetService.hash("tok"), user, NOW.minusSeconds(1));
        when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> service.resetPassword("tok", "NewPass1!"))
                .isInstanceOf(InvalidResetTokenException.class)
                .hasMessage(PasswordResetService.INVALID_LINK);

        assertThat(user.getPassword()).isEqualTo("old-hash");
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_unknownToken_isRejected() {
        when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetPassword("bogus", "NewPass1!"))
                .isInstanceOf(InvalidResetTokenException.class);
        verifyNoInteractions(passwordEncoder);
    }
}
