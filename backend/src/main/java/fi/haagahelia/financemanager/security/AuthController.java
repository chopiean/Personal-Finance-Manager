package fi.haagahelia.financemanager.security;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import fi.haagahelia.financemanager.user.UserService;
import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request,
                              HttpServletRequest httpRequest) {

        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, context);

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userService.toResponse(user);
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody UserRegisterRequest request) {
        return userService.register(request);
    }

    public record LoginRequest(String username, String password) {}
}
