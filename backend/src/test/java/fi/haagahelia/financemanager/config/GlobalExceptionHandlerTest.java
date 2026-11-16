package fi.haagahelia.financemanager.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    record Body(@NotBlank(message = "Name is required") String name) {}

    @RestController
    static class ThrowingController {
        @PostMapping("/validate")
        String validate(@Valid @RequestBody Body body) { return "ok"; }

        @GetMapping("/forbidden")
        String forbidden() { throw new SecurityException("Not your account"); }

        @GetMapping("/runtime")
        String runtime() { throw new IllegalArgumentException("This username is already taken."); }
    }

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ThrowingController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void validationErrors_return400WithFieldMessages() throws Exception {
        mockMvc.perform(post("/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").value("Name is required"));
    }

    @Test
    void securityException_returns403WithMessage() throws Exception {
        mockMvc.perform(get("/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Not your account"));
    }

    @Test
    void runtimeException_returns400WithMessage() throws Exception {
        mockMvc.perform(get("/runtime"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("This username is already taken."));
    }
}
