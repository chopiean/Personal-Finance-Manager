package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.assistant.dto.ChatRequest;
import fi.haagahelia.financemanager.assistant.dto.ChatResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private static final Logger log = LoggerFactory.getLogger(AssistantController.class);

    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return assistantService.chat(request);
    }

    /** AI not configured or unreachable → 503 instead of the global 400. */
    @ExceptionHandler(AssistantUnavailableException.class)
    public ResponseEntity<String> handleUnavailable(AssistantUnavailableException ex) {
        log.warn("AI assistant unavailable: {}", ex.getMessage(), ex.getCause());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(ex.getMessage());
    }
}