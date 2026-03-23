package com.studyplanner.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.config.GroqProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Dedicated client for communicating with the Groq API.
 * Pulls raw LLM interaction away from the business service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GroqAPIClient {

    private final GroqProperties groqProperties;
    private final ObjectMapper   objectMapper;

    /**
     * Calls the Groq Chat Completions endpoint.
     *
     * @param systemPrompt Instructions for the LLM behavior.
     * @param userPrompt   The actual study plan requirements.
     * @return Raw content string from the assistant's message.
     */
    public String getChatCompletion(String systemPrompt, String userPrompt) {
        WebClient client = WebClient.builder()
                .baseUrl(groqProperties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + groqProperties.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> requestBody = Map.of(
                "model",       groqProperties.getModel(),
                "max_tokens",  groqProperties.getMaxTokens(),
                "temperature", groqProperties.getTemperature(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userPrompt)
                )
        );

        try {
            String responseJson = client.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(groqProperties.getTimeoutSeconds()))
                    .block();

            JsonNode root    = objectMapper.readTree(responseJson);
            String   content = root.path("choices")
                                   .path(0)
                                   .path("message")
                                   .path("content")
                                   .asText();

            if (content.isBlank()) {
                throw new RuntimeException("Groq returned empty content");
            }
            return content;

        } catch (WebClientResponseException ex) {
            log.error("Groq API error {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("Groq API returned an error: " + ex.getStatusCode(), ex);
        } catch (Exception ex) {
            log.error("Failed to call Groq API: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to reach Groq API: " + ex.getMessage(), ex);
        }
    }
}
