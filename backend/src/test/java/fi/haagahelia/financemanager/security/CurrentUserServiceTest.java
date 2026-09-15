package fi.haagahelia.financemanager.security;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrentUserServiceTest {

    @Mock
    private UserRepository userRepository;

    private CurrentUserService currentUserService;

    @BeforeEach
    void setUp() {
        currentUserService = new CurrentUserService(userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUser_returnsUser_whenAuthenticated() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("jdoe", "pw"));

        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));

        User result = currentUserService.getCurrentUser();

        assertThat(result.getUsername()).isEqualTo("jdoe");
    }

    @Test
    void getCurrentUser_throws_whenNoAuthentication() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> currentUserService.getCurrentUser())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void getCurrentUser_throws_whenUserNotFoundInDb() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ghost", "pw"));

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> currentUserService.getCurrentUser())
                .isInstanceOf(IllegalStateException.class);
    }
}
