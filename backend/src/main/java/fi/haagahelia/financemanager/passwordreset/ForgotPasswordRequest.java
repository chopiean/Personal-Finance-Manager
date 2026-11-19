package fi.haagahelia.financemanager.passwordreset;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    /** Username or email address. */
    @NotBlank(message = "Please enter your email or username.")
    private String identifier;
}
