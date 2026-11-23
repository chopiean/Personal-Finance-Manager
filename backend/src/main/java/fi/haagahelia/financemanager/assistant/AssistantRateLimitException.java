package fi.haagahelia.financemanager.assistant;

public class AssistantRateLimitException extends RuntimeException {
    public AssistantRateLimitException(String message) {
        super(message);
    }
}