package com.studyplanner.service;

import com.studyplanner.dto.AuthResponse;
import com.studyplanner.dto.LoginRequest;
import com.studyplanner.dto.RegisterRequest;
import com.studyplanner.model.Role;
import com.studyplanner.model.User;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration and login.
 *
 * <p>Registration flow:</p>
 * <ol>
 *   <li>Validate that the email is not already taken.</li>
 *   <li>BCrypt-encode the raw password.</li>
 *   <li>Persist the new {@link User} document to MongoDB.</li>
 *   <li>Generate and return a signed JWT.</li>
 * </ol>
 *
 * <p>Login flow:</p>
 * <ol>
 *   <li>Delegate credential check to Spring Security's {@link AuthenticationManager}.</li>
 *   <li>Load the authenticated user from MongoDB.</li>
 *   <li>Generate and return a signed JWT.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository         userRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtUtil                jwtUtil;
    private final AuthenticationManager   authenticationManager;
    private final UserDetailsService      userDetailsService;

    // =========================================================================
    // Registration
    // =========================================================================

    /**
     * Registers a new user account.
     *
     * @param request validated registration payload
     * @return {@link AuthResponse} containing a fresh JWT and user details
     * @throws IllegalStateException if the email is already registered
     */
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException(
                    "Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved);

        return buildAuthResponse(token, saved);
    }

    // =========================================================================
    // Login
    // =========================================================================

    /**
     * Authenticates an existing user and returns a JWT.
     *
     * @param request validated login payload
     * @return {@link AuthResponse} containing a fresh JWT and user details
     * @throws org.springframework.security.core.AuthenticationException
     *         if credentials are invalid or the account is disabled
     */
    public AuthResponse login(LoginRequest request) {

        // Throws BadCredentialsException / DisabledException on failure
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Load as UserDetails from our custom service
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        String token = jwtUtil.generateToken(userDetails);

        // Cast to our model for extraction
        User user = (User) userDetails;
        return buildAuthResponse(token, user);
    }

    /**
     * Fetches user details by email and builds an AuthResponse (without a new token).
     */
    public AuthResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        return buildAuthResponse(null, user);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
