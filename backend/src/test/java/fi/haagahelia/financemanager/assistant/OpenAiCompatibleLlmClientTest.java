package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.assistant.dto.ChatMessage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class OpenAiCompatibleLlmClientTest {

    private static final String BASE = "http://llm.test/v1";

    private MockRestServiceServer server;

    private OpenAiCompatibleLlmClient client(String apiKey) {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        return new OpenAiCompatibleLlmClient(builder, BASE, apiKey, "test-model", 123);
    }

    @Test
    void complete_throwsUnavailable_whenApiKeyMissing() {
        for (String key : new String[]{null, "", "   "}) {
            OpenAiCompatibleLlmClient c = client(key);
            assertThatThrownBy(() -> c.complete("sys", List.of()))
                    .isInstanceOf(AssistantUnavailableException.class)
                    .hasMessageContaining("not configured");
        }
    }

    @Test
    void complete_sendsOpenAiRequestAndReturnsTrimmedContent() {
        OpenAiCompatibleLlmClient c = client("secret-key");
        server.expect(requestTo(BASE + "/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer secret-key"))
                .andExpect(jsonPath("$.model").value("test-model"))
                .andExpect(jsonPath("$.max_tokens").value(123))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[0].content").value("SYSTEM"))
                .andExpect(jsonPath("$.messages[1].role").value("user"))
                .andExpect(jsonPath("$.messages[1].content").value("Hi"))
                .andExpect(jsonPath("$.messages[2].role").value("assistant"))
                .andRespond(withSuccess(
                        "{\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"  Hello!  \"}}]}",
                        MediaType.APPLICATION_JSON));

        String reply = c.complete("SYSTEM", List.of(
                new ChatMessage("user", "Hi"),
                new ChatMessage("assistant", "Hey")));

        assertThat(reply).isEqualTo("Hello!");
        server.verify();
    }

    @Test
    void complete_throwsUnavailable_whenChoicesEmpty() {
        OpenAiCompatibleLlmClient c = client("k");
        server.expect(requestTo(BASE + "/chat/completions"))
                .andRespond(withSuccess("{\"choices\":[]}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> c.complete("sys", List.of()))
                .isInstanceOf(AssistantUnavailableException.class)
                .hasMessageContaining("empty response");
    }

    @Test
    void complete_throwsUnavailable_whenChoicesMissing() {
        OpenAiCompatibleLlmClient c = client("k");
        server.expect(requestTo(BASE + "/chat/completions"))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> c.complete("sys", List.of()))
                .isInstanceOf(AssistantUnavailableException.class)
                .hasMessageContaining("empty response");
    }

    @Test
    void complete_wrapsProviderErrors() {
        OpenAiCompatibleLlmClient c = client("k");
        server.expect(requestTo(BASE + "/chat/completions")).andRespond(withServerError());

        assertThatThrownBy(() -> c.complete("sys", List.of()))
                .isInstanceOf(AssistantUnavailableException.class)
                .hasMessageContaining("Could not reach the AI provider")
                .hasCauseInstanceOf(org.springframework.web.client.RestClientException.class);
    }

    @Test
    void complete_wrapsUnauthorized() {
        OpenAiCompatibleLlmClient c = client("bad-key");
        server.expect(requestTo(BASE + "/chat/completions")).andRespond(withUnauthorizedRequest());

        assertThatThrownBy(() -> c.complete("sys", List.of()))
                .isInstanceOf(AssistantUnavailableException.class);
    }
}
