package fi.haagahelia.financemanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point of the Personal Finance Manager backend.
 *
 * The @EnableScheduling annotation is used for running
 * scheduled tasks (monthly summary calculation).
 */
@SpringBootApplication
@EnableScheduling
public class FinancemanagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinancemanagerApplication.class, args);
    }
}
