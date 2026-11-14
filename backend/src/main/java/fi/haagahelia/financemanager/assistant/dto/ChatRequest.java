package fi.haagahelia.financemanager.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ChatRequest(
    @NotBlank(message = "Message must not be empty")
    @Size (max = 1000, message = "Message must be at most 1000 characters")
    String message,
    List<ChatMessage> history
) {
    
}
