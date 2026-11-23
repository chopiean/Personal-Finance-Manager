package fi.haagahelia.financemanager.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.haagahelia.financemanager.assistant.dto.ChatRequest;
import fi.haagahelia.financemanager.assistant.dto.ChatResponse;
import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssistantController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class AssistantControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AssistantService assistantService;
    @MockBean private JwtService jwtService;
    @MockBean private UserRepository userRepository;

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }

    @Test
    void chat_rejectsUnauthenticatedRequest() throws Exception {
        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("hi", null))))
                .andExpect(status().is4xxClientError());

        verify(assistantService, never()).chat(any());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void chat_returnsReply() throws Exception {
        when(assistantService.chat(any())).thenReturn(new ChatResponse("Your balance is €100."));

        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("What's my balance?", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Your balance is €100."));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void chat_returns400_whenMessageBlank() throws Exception {
        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("   ", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Message must not be empty"));

        verify(assistantService, never()).chat(any());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void chat_returns400_whenMessageTooLong() throws Exception {
        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("x".repeat(1001), null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Message must be at most 1000 characters"));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void chat_returns503_whenAssistantUnavailable() throws Exception {
        when(assistantService.chat(any()))
                .thenThrow(new AssistantUnavailableException("AI assistant is not configured. Set AI_API_KEY."));

        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("hi", null))))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().string("AI assistant is not configured. Set AI_API_KEY."));
    }

    @Test
    @WithMockUser(username = "jdoe")
    void chat_returns429_whenRateLimitExceeded() throws Exception {
        when(assistantService.chat(any()))
                .thenThrow(new AssistantRateLimitException("Too many questions. Please wait a minute and try again."));

        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ChatRequest("hi", null))))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string("Too many questions. Please wait a minute and try again."));
    }
}