package fi.haagahelia.financemanager.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public, lightweight endpoint. The frontend pings it when the login page
 * opens so a sleeping free-tier server starts waking up early, and an uptime
 * monitor can ping it to keep the server awake.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
