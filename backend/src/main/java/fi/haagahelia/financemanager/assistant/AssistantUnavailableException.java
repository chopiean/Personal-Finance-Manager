package fi.haagahelia.financemanager.assistant;

public class AssistantUnavailableException extends RuntimeException {
    public AssistantUnavailableException(String message) {
        super(message);
    }
    public AssistantUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
