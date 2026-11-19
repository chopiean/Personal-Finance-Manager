package fi.haagahelia.financemanager.passwordreset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Sends the reset link by email. Spring only creates a JavaMailSender when
 * SMTP is configured (spring.mail.host / SPRING_MAIL_HOST); without it, e.g.
 * in local development, the link is written to the log instead.
 */
@Component
public class PasswordResetMailer {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetMailer.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    public PasswordResetMailer(ObjectProvider<JavaMailSender> mailSender,
                               @Value("${app.mail.from:no-reply@finance-manager.local}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendResetLink(String to, String username, String link, long validMinutes) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.info("Email is not configured. Password reset link for {}: {}", username, link);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Reset your Finance password");
        message.setText("""
                Hi %s,

                We received a request to reset your Finance password.
                Open this link to choose a new one (valid for %d minutes):

                %s

                If you didn't ask for this, you can ignore this email; your password won't change.
                """.formatted(username, validMinutes, link));

        try {
            sender.send(message);
        } catch (MailException ex) {
            // Don't reveal delivery problems to the caller; just record them.
            log.error("Could not send password reset email to user {}", username, ex);
        }
    }
}
