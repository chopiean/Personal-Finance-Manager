package fi.haagahelia.financemanager.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    /** The registered username, even when the user logged in with their email. */
    private String username;
}
