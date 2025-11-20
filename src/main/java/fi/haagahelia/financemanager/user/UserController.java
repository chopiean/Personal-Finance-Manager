package fi.haagahelia.financemanager.user;

import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints related to user management and authentication.
 */
@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService,
                          UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    /**
     * Public endpoint: register a new user.
     *
     * Example request body:
     * {
     *   "username": "test@example.com",
     *   "password": "secret123"
     * }
     */
    @PostMapping("/register")
    public UserResponse register(@Validated @RequestBody UserRegisterRequest request) {
        return userService.register(request);
    }

    /**
     * Returns info about the currently authenticated user.
     * Requires Authorization header with Basic auth.
     */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userService.toResponse(user);
    }
}
