package com.studyplanner.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for the Groq API.
 * Loaded from application.yml (app.groq.*).
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.groq")
public class GroqProperties {

    private String apiKey;
    private String baseUrl = "https://api.groq.com/openai/v1";
    private String model = "llama3-70b-8192";
    private int maxTokens = 2048;
    private double temperature = 0.7;
    private int timeoutSeconds = 30;
}
