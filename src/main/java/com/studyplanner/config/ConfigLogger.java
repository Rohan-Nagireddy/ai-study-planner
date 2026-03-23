package com.studyplanner.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utility component to verify that OAuth2 environment variables are loaded.
 * Prints masked values at startup for debugging.
 */
@Slf4j
@Component
public class ConfigLogger {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    @PostConstruct
    public void logConfig() {
        log.info("============== OAUTH2 CONFIGURATION CHECK ==============");
        log.info("Google Client ID:     {}", maskValue(googleClientId));
        log.info("Google Client Secret: {}", maskValue(googleClientSecret));
        log.info("GitHub Client ID:     {}", maskValue(githubClientId));
        log.info("GitHub Client Secret: {}", maskValue(githubClientSecret));
        log.info("========================================================");
        
        if (isMissing(googleClientId) || isMissing(githubClientId)) {
            log.warn("CRITICAL: Social login credentials appear to be missing or using fallbacks!");
            log.warn("Please set environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.");
        }
    }

    private String maskValue(String value) {
        if (value == null || value.isEmpty() || value.contains("MISSING_")) {
            return "NOT_SET";
        }
        if (value.length() <= 8) {
            return "**** (too short to mask safely)";
        }
        return value.substring(0, 4) + "...." + value.substring(value.length() - 4);
    }

    private boolean isMissing(String value) {
        return value == null || value.contains("MISSING_") || value.equals("NOT_SET");
    }
}
