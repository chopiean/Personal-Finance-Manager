package fi.haagahelia.financemanager.passwordreset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Reset link is missing or invalid.")
    private String token;

    // Same rule as registration (UserRegisterRequest)
    @NotBlank(message = "Password is required.")
    @Pattern(
            regexp = "^(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
            message = "Password must be at least 8 characters and contain a number and a special character."
    )
    private String password;
}
