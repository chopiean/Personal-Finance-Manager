package fi.haagahelia.financemanager.user;

import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ----------------------
    // REGISTER NEW USER
    // ----------------------
    @Transactional
    public UserResponse register(UserRegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("This email is already registered.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    // ----------------------
    // GET USER BY ID
    // ----------------------
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ----------------------
    // MAP ENTITY → DTO
    // ----------------------
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}
