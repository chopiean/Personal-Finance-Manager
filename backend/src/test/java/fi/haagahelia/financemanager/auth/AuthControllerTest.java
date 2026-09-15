package fi.haagahelia.financemanager.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import fi.haagahelia.financemanager.user.UserService;
import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void login_returnsToken_onSuccess() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("jdoe");
        req.setPassword("pw");

        Authentication auth = new UsernamePasswordAuthenticationToken(
                User.withUsername("jdoe").password("pw").roles("USER").build(), "pw");

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtService.generateToken(any())).thenReturn("fake-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"));
    }

    @Test
    void login_returns400_onBadCredentials() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("jdoe");
        req.setPassword("wrong");

        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_returnsCreatedUser() throws Exception {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setUsername("jdoe");
        req.setEmail("jdoe@example.com");
        req.setPassword("pw");

        when(userService.register(any(UserRegisterRequest.class)))
                .thenReturn(new UserResponse(1L, "jdoe", "jdoe@example.com", "ROLE_USER"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jdoe"));
    }
}
