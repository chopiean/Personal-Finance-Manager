package fi.haagahelia.financemanager.assistant;

import fi.haagahelia.financemanager.assistant.dto.ChatMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component 
public class OpenAiCompatibleLlmClient {
    
    private final RestClient restClient;
    private final String apiKey
    private final String model
    private final int maxTokens;

    public OpenAiCompatibleLlmClient(
            RestClient.Builder builder,
            @Value("${ai.base-url:https://api.groq.com/openai/v1}") String baseUrl,
            @Value("${ai.api-key:}") String apiKey,
            @Value("${ai.model:openai/gpt-oss-120b}") String model,
            @Value("${ai.max-tokens:800}") int maxTokens) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
    }

    @Override 
    @SuppressWarnings ("unchecked")
    public String complete(String systemPrompt, List<ChatMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AssistantUnavailableException("AI assistant is not configured. Set AI_API_KEY.")
        }

        List<Map<String, String>> payload = new ArrayList<>();
        payload.add(Map.of("role", "system", "content", systemPrompt));
        messages.forEach(m -> payload.add(Map.of("role", m.role(), "content", m.content())));

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", payload,
                "max_tokens", maxTokens,
                "temperature", 0.3
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            
            var choices = response == null ? null
                    : (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new AssistantUnavailableException("AI provider returned an empty response.");
            }
            var message = (Map<String, Object>) choices.get(0).get("message");
            return String.valueOf(message.get("content")).trim();
        } catch (RestClientException ex) {
            throw new AssistantUnavailableException("Could not reach the AI provider. Try again later.", ex);
        }
    }
}
