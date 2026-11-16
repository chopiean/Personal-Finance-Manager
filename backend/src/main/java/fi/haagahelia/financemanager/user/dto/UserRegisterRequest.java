package fi.haagahelia.financemanager.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRegisterRequest {

    @NotBlank(message = "Username is required.")
    private String username;

    @NotBlank(message = "Password is required.")
    @Pattern(
            regexp = "^(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
            message = "Password must be at least 8 characters and contain a number and a special character."
    )
    private String password;

    @NotBlank(message = "Email is required.")
    @Pattern(
            regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$",
            message = "Please enter a valid email address."
    )
    private String email;
}
