package fi.haagahelia.financemanager.passwordreset;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    static final String SENT_MESSAGE =
            "If an account matches, we've sent a link to reset the password.";

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getIdentifier());
        // Same answer whether or not the account exists
        return Map.of("message", SENT_MESSAGE);
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getPassword());
        return Map.of("message", "Your password has been reset. You can now log in.");
    }
}
