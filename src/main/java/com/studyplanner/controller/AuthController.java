package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.dto.AuthResponse;
import com.studyplanner.dto.LoginRequest;
import com.studyplanner.dto.RegisterRequest;
import com.studyplanner.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication REST controller.
 *
 * <pre>
 * POST /api/auth/register  →  create account + return JWT
 * POST /api/auth/login     →  validate credentials + return JWT
 * </pre>
 *
 * Both endpoints are publicly accessible (configured in {@code SecurityConfig}).
 * All business logic is delegated to {@link AuthService}.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account.
     *
     * <p>Sample request body:
     * <pre>{@code
     * {
     *   "name": "Rohan Sharma",
     *   "email": "rohan@example.com",
     *   "password": "SecurePass1"
     * }
     * }</pre>
     *
     * @param request validated registration payload
     * @return 201 CREATED with JWT and user details on success
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authResponse));
    }

    /**
     * Authenticates an existing user.
     *
     * <p>Sample request body:
     * <pre>{@code
     * {
     *   "email": "rohan@example.com",
     *   "password": "SecurePass1"
     * }
     * }</pre>
     *
     * @param request validated login payload
     * @return 200 OK with JWT and user details on success
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    /**
     * Returns the current user's profile based on the JWT.
     */
    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            java.security.Principal principal) {
        
        AuthResponse authResponse = authService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("User profile fetched", authResponse));
    }
}
