package com.studyplanner.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.Map;

/**
 * Custom resolver that logs the OAuth2 Authorization Request parameters 
 * before the user is redirected to the provider (Google/GitHub).
 */
@Slf4j
public class CustomOAuth2RequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomOAuth2RequestResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authRequest = defaultResolver.resolve(request);
        return logRequest(authRequest);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest authRequest = defaultResolver.resolve(request, clientRegistrationId);
        return logRequest(authRequest);
    }

    private OAuth2AuthorizationRequest logRequest(OAuth2AuthorizationRequest request) {
        if (request != null) {
            log.info("======= OAUTH2 AUTHORIZATION REQUEST =======");
            log.info("Client ID:    {}", request.getClientId());
            log.info("Redirect URI: {}", request.getRedirectUri());
            log.info("Scopes:       {}", request.getScopes());
            log.info("Auth URI:     {}", request.getAuthorizationUri());
            
            Map<String, Object> additional = request.getAdditionalParameters();
            if (additional != null && !additional.isEmpty()) {
                log.info("Extra Params: {}", additional);
            }
            log.info("============================================");
        }
        return request;
    }
}
