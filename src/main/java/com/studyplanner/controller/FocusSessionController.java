package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.dto.EndSessionRequest;
import com.studyplanner.dto.FocusSessionResponse;
import com.studyplanner.dto.StartSessionRequest;
import com.studyplanner.model.User;
import com.studyplanner.service.FocusSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for focus session management.
 *
 * <p>All endpoints require a valid JWT ({@code Authorization: Bearer <token>}).
 * The authenticated {@link User} is resolved via {@link AuthenticationPrincipal}.</p>
 *
 * <pre>
 * POST  /api/focus/start            → start a new focus session
 * POST  /api/focus/{id}/end         → end an active session + compute score
 * GET   /api/focus/history          → full session history for the user
 * GET   /api/focus/active           → currently running session (if any)
 * </pre>
 */
@RestController
@RequestMapping("/api/focus")
@RequiredArgsConstructor
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    // =========================================================================
    // Start session
    // =========================================================================

    /**
     * Starts a new focus session for the authenticated user.
     *
     * <p>Returns {@code 409 Conflict} if an active session already exists.</p>
     *
     * <p>Sample request (body is optional):
     * <pre>{@code
     * POST /api/focus/start
     * { "note": "Chapter 5 — Integration by parts" }
     * }</pre>
     *
     * @param currentUser the JWT principal
     * @param request     optional session note
     * @return 201 CREATED with the session document
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> startSession(
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) StartSessionRequest request) {

        StartSessionRequest req = (request != null) ? request : new StartSessionRequest();
        FocusSessionResponse session = focusSessionService.startSession(currentUser.getId(), req);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Focus session started", session));
    }

    // =========================================================================
    // End session
    // =========================================================================

    /**
     * Ends the specified focus session and returns the computed focus score.
     *
     * <p>Sample request:
     * <pre>{@code
     * POST /api/focus/{id}/end
     * { "distractionCount": 2 }
     * }</pre>
     *
     * @param currentUser      the JWT principal
     * @param id               the session ID to end
     * @param request          distraction count reported by the client
     * @return 200 OK with the completed session (score, duration, rating populated)
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> endSession(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String id,
            @Valid @RequestBody EndSessionRequest request) {

        FocusSessionResponse session = focusSessionService.endSession(
                id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Focus session ended", session));
    }

    // =========================================================================
    // History
    // =========================================================================

    /**
     * Returns the full focus session history for the authenticated user,
     * ordered newest first.
     *
     * @param currentUser the JWT principal
     * @return 200 OK with a list of sessions
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<FocusSessionResponse>>> getHistory(
            @AuthenticationPrincipal User currentUser) {

        List<FocusSessionResponse> history =
                focusSessionService.getUserHistory(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // =========================================================================
    // Active session
    // =========================================================================

    /**
     * Returns the currently active (un-ended) focus session for the user,
     * or {@code null} if no session is running.
     *
     * @param currentUser the JWT principal
     * @return 200 OK with the active session or {@code data: null}
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<FocusSessionResponse>> getActiveSession(
            @AuthenticationPrincipal User currentUser) {

        FocusSessionResponse active =
                focusSessionService.getActiveSession(currentUser.getId());
        String message = (active != null) ? "Active session found" : "No active session";
        return ResponseEntity.ok(ApiResponse.success(message, active));
    }
}
