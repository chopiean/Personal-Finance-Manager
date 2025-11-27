package fi.haagahelia.financemanager.auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; 
    private String password;
}
