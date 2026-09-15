package fi.haagahelia.financemanager.user;

import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

    @Test
    void me_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void me_returnsCurrentUser() throws Exception {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        when(userRepository.findByUsername("jdoe")).thenReturn(Optional.of(user));
        when(userService.toResponse(user)).thenReturn(new UserResponse(1L, "jdoe", "jdoe@example.com", "ROLE_USER"));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jdoe"));
    }

    @Test
    @WithMockUser(username = "ghost")
    void me_returns400_whenUserNotFoundInDb() throws Exception {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isBadRequest());
    }
}
