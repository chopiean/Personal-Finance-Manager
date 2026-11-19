package fi.haagahelia.financemanager.passwordreset;

/** Handled by GlobalExceptionHandler's RuntimeException handler → 400 with the message. */
public class InvalidResetTokenException extends RuntimeException {
    public InvalidResetTokenException(String message) {
        super(message);
    }
}
