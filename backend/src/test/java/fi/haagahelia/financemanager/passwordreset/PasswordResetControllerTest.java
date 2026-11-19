package fi.haagahelia.financemanager.passwordreset;

import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PasswordResetController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class PasswordResetControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private PasswordResetService passwordResetService;
    @MockBean private JwtService jwtService;
    @MockBean private UserRepository userRepository;

    @Test
    void forgotPassword_isPublic_andAlwaysGivesTheSameAnswer() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"jane@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(PasswordResetController.SENT_MESSAGE));

        verify(passwordResetService).requestReset("jane@example.com");
    }

    @Test
    void forgotPassword_blankIdentifier_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.identifier").exists());

        verifyNoInteractions(passwordResetService);
    }

    @Test
    void resetPassword_isPublic_andResets() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"tok\",\"password\":\"NewPass1!\"}"))
                .andExpect(status().isOk());

        verify(passwordResetService).resetPassword("tok", "NewPass1!");
    }

    @Test
    void resetPassword_weakPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"tok\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());

        verifyNoInteractions(passwordResetService);
    }

    @Test
    void resetPassword_invalidToken_returns400WithMessage() throws Exception {
        doThrow(new InvalidResetTokenException(PasswordResetService.INVALID_LINK))
                .when(passwordResetService).resetPassword("bad", "NewPass1!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"bad\",\"password\":\"NewPass1!\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(PasswordResetService.INVALID_LINK));
    }
}
