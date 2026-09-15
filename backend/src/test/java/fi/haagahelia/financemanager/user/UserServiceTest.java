package fi.haagahelia.financemanager.user;

import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void register_success() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setUsername("jdoe");
        req.setEmail("jdoe@example.com");
        req.setPassword("plainpw");

        when(userRepository.existsByUsername("jdoe")).thenReturn(false);
        when(userRepository.existsByEmail("jdoe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainpw")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse resp = userService.register(req);

        assertThat(resp.getUsername()).isEqualTo("jdoe");
        assertThat(resp.getEmail()).isEqualTo("jdoe@example.com");
        assertThat(resp.getRole()).isEqualTo("ROLE_USER");

        verify(userRepository).save(argThat(u -> u.getPassword().equals("hashed")));
    }

    @Test
    void register_throws_whenUsernameTaken() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setUsername("jdoe");
        req.setEmail("jdoe@example.com");
        req.setPassword("plainpw");

        when(userRepository.existsByUsername("jdoe")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("username");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throws_whenEmailTaken() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setUsername("jdoe");
        req.setEmail("jdoe@example.com");
        req.setPassword("plainpw");

        when(userRepository.existsByUsername("jdoe")).thenReturn(false);
        when(userRepository.existsByEmail("jdoe@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
    }

    @Test
    void getUserById_success() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);

        assertThat(result.getUsername()).isEqualTo("jdoe");
    }

    @Test
    void getUserById_throws_whenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void toResponse_mapsAllFields() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_ADMIN");

        UserResponse resp = userService.toResponse(user);

        assertThat(resp.getUsername()).isEqualTo("jdoe");
        assertThat(resp.getEmail()).isEqualTo("jdoe@example.com");
        assertThat(resp.getRole()).isEqualTo("ROLE_ADMIN");
    }
}
