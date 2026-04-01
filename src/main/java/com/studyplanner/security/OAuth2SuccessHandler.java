package com.studyplanner.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Custom success handler for OAuth2 login.
 * 
 * <p>After successful authentication with Google/GitHub:</p>
 * <ol>
 *   <li>Extract user info (email, name).</li>
 *   <li>Sync with MongoDB (create if missing).</li>
 *   <li>Generate a standard JWT token.</li>
 *   <li>Redirect back to the React frontend with the token as a URL parameter.</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil        jwtUtil;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest  request,
            HttpServletResponse response,
            Authentication      authentication
    ) throws IOException, ServletException {

        // The principal is our User entity, which implements both OAuth2User and UserDetails
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        log.info("OAuth2 login successful for user: {}", userDetails.getUsername());

        // 1. Generate JWT
        String token = jwtUtil.generateToken(userDetails);

        // 2. Build redirect URL — hardcoded for production reliability
        String frontendRedirectUrl = "https://effervescent-madeleine-f7e9c1.netlify.app";
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl + "/oauth-success")
                .queryParam("token", token)
                .build().toUriString();

        log.info("Redirecting OAuth2 user to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
