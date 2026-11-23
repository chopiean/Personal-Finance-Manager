package fi.haagahelia.financemanager.assistant;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AssistantRateLimiterTest {

    private static final Instant START = Instant.parse("2026-11-24T10:00:00Z");

    /** A clock the test can move forward. */
    private static class MutableClock extends Clock {
        private Instant now;
        MutableClock(Instant start) { this.now = start; }
        void advance(Duration d) { now = now.plus(d); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void allowsUpToTheLimit() {
        AssistantRateLimiter limiter = new AssistantRateLimiter(new MutableClock(START));

        for (int i = 0; i < AssistantRateLimiter.MAX_REQUESTS; i++) {
            assertThatCode(() -> limiter.check("an")).doesNotThrowAnyException();
        }
    }

    @Test
    void blocksTheNextQuestionWithinTheWindow() {
        AssistantRateLimiter limiter = new AssistantRateLimiter(new MutableClock(START));
        for (int i = 0; i < AssistantRateLimiter.MAX_REQUESTS; i++) {
            limiter.check("an");
        }

        assertThatThrownBy(() -> limiter.check("an"))
                .isInstanceOf(AssistantRateLimitException.class)
                .hasMessageContaining("Too many questions");
    }

    @Test
    void allowsAgainAfterTheWindowHasPassed() {
        MutableClock clock = new MutableClock(START);
        AssistantRateLimiter limiter = new AssistantRateLimiter(clock);
        for (int i = 0; i < AssistantRateLimiter.MAX_REQUESTS; i++) {
            limiter.check("an");
        }

        clock.advance(AssistantRateLimiter.WINDOW.plusSeconds(1));

        assertThatCode(() -> limiter.check("an")).doesNotThrowAnyException();
    }

    @Test
    void countsEachUserSeparately() {
        AssistantRateLimiter limiter = new AssistantRateLimiter(new MutableClock(START));
        for (int i = 0; i < AssistantRateLimiter.MAX_REQUESTS; i++) {
            limiter.check("an");
        }

        assertThatCode(() -> limiter.check("other")).doesNotThrowAnyException();
    }
}