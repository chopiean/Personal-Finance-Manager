package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.assistant.dto.ChatMessage;
import java.util.List;

public interface LlmClient {
    String complete(String systemPromt, List<ChatMessage> messages);
}
