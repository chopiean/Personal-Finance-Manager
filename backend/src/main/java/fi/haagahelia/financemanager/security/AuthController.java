package fi.haagahelia.financemanager.security;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationManager authManager;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authManager, UserRepository userRepository) {
        this.authManager = authManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request, HttpSession session) {

        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.username(),
                request.password()
            )
        );

        session.setAttribute("user", auth.getPrincipal());

        return userRepository.findByUsername(request.username())
            .orElseThrow();
    }

    public record LoginRequest(String username, String password) {}
}
