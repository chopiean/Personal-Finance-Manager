package fi.haagahelia.financemanager.assistant;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component 
public class AssistantRateLimiter {
    
    static final int MAX_REQUESTS = 10;
    static final Duration WINDOW = Duration.ofMinutes(1);

    private final Map<String, Deque<Instant>> requests = new ConcurrentHashMap<>();
    private final Clock clock;

    public AssistantRateLimiter() {
        this(Clock.systemUTC());
    }

    AssistantRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void check(String username) {
        Instant now = clock.instant();
        Deque<Instant> times = requests.computeIfAbsent(username, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && times.peekFirst().isBefore(now.minus(WINDOW))) {
                times.pollFirst();
            }
            if (times.size() >= MAX_REQUESTS) {
                throw new AssistantRateLimitException(
                        "Too many questions. Please wait a minute and try again.");
            }
            times.addLast(now);
        }
    }
}
