package com.studyplanner.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter — runs exactly once per HTTP request.
 *
 * <p>Processing steps:</p>
 * <ol>
 *   <li>Extract the {@code Authorization} header.</li>
 *   <li>Skip requests without a {@code Bearer} prefix (pass to next filter).</li>
 *   <li>Parse the JWT and extract the username (email).</li>
 *   <li>If the token is valid and the Security context is empty, load the
 *       {@code UserDetails} from the database and set the authentication.</li>
 *   <li>Continue the filter chain.</li>
 * </ol>
 *
 * <p>The filter is registered before
 * {@link org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter}
 * in {@link com.studyplanner.config.SecurityConfig}.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil                  jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest  request,
            HttpServletResponse response,
            FilterChain         filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // ── 1. No Bearer token → skip JWT processing ────────────────────────
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        // ── 2. Basic structural / signature check before parsing claims ──────
        if (!jwtUtil.isTokenWellFormed(jwt)) {
            log.debug("Rejected malformed/expired JWT for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // ── 3. Extract subject (email) ────────────────────────────────────────
        final String username = jwtUtil.extractUsername(jwt);

        // ── 4. Only set authentication if not already set (stateless) ────────
        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("Authenticated user '{}' via JWT", username);
            }
        }

        filterChain.doFilter(request, response);
    }
}
