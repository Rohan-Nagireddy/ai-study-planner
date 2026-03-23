package com.studyplanner.service;

import com.studyplanner.dto.EndSessionRequest;
import com.studyplanner.dto.FocusSessionResponse;
import com.studyplanner.dto.StartSessionRequest;
import com.studyplanner.model.FocusSession;
import com.studyplanner.repository.FocusSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Business logic for focus session tracking.
 *
 * <h3>Focus Score Algorithm</h3>
 * <pre>
 *   baseScore  = clamp(duration / 25.0, 0, 5) × 20    → max 100 for ≥25-min sessions
 *   penalty    = distractionCount × 10                  → −10 per distraction
 *   focusScore = clamp(baseScore − penalty, 0, 100)    → never below 0 or above 100
 * </pre>
 *
 * <p>Examples:</p>
 * <ul>
 *   <li>30 min, 0 distractions → score 100</li>
 *   <li>30 min, 3 distractions → score 70</li>
 *   <li>10 min, 0 distractions → score 80</li>
 *   <li>10 min, 9 distractions → score  0</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FocusSessionService {

    private final FocusSessionRepository sessionRepository;

    // =========================================================================
    // Start session
    // =========================================================================

    /**
     * Starts a new focus session for the authenticated user.
     *
     * <p>If the user already has an active session (endTime is null), that
     * session is returned instead of creating a duplicate.</p>
     *
     * @param userId  the ID of the authenticated user
     * @param request optional start payload (e.g. session note)
     * @return the active {@link FocusSessionResponse}
     */
    public FocusSessionResponse startSession(String userId, StartSessionRequest request) {

        // Guard: return existing active session rather than creating a duplicate
        sessionRepository.findByUserIdAndEndTimeIsNull(userId).ifPresent(active -> {
            throw new IllegalStateException(
                    "You already have an active session (id=" + active.getId() + "). "
                    + "End it before starting a new one.");
        });

        FocusSession session = FocusSession.builder()
                .userId(userId)
                .startTime(LocalDateTime.now())
                .build();

        FocusSession saved = sessionRepository.save(session);
        log.info("Focus session started: id={}, userId={}", saved.getId(), userId);
        return toResponse(saved);
    }

    // =========================================================================
    // End session
    // =========================================================================

    /**
     * Ends an active focus session, calculates duration and focus score, and saves.
     *
     * @param sessionId the ID of the session to end
     * @param userId    the ID of the authenticated user
     * @param request   carries the distraction count reported by the client
     * @return the completed {@link FocusSessionResponse} with score populated
     * @throws NoSuchElementException  if the session is not found for this user
     * @throws IllegalStateException   if the session is already ended
     */
    public FocusSessionResponse endSession(String sessionId, String userId,
                                           EndSessionRequest request) {

        FocusSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Session not found with id: " + sessionId));

        if (session.getEndTime() != null) {
            throw new IllegalStateException("Session is already ended.");
        }

        LocalDateTime endTime = LocalDateTime.now();
        long durationMinutes  = ChronoUnit.MINUTES.between(session.getStartTime(), endTime);
        int  distractions     = request.getDistractionCount();
        int  score            = calculateFocusScore(durationMinutes, distractions);

        session.setEndTime(endTime);
        session.setDuration(durationMinutes);
        session.setDistractionCount(distractions);
        session.setFocusScore(score);

        FocusSession saved = sessionRepository.save(session);
        log.info("Focus session ended: id={}, duration={}min, score={}", saved.getId(),
                durationMinutes, score);
        return toResponse(saved);
    }

    // =========================================================================
    // History
    // =========================================================================

    /**
     * Returns the full focus session history for a user, newest first.
     */
    public List<FocusSessionResponse> getUserHistory(String userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns the currently active session (if any) for the user.
     * Returns {@code null} if no active session exists.
     */
    public FocusSessionResponse getActiveSession(String userId) {
        return sessionRepository.findByUserIdAndEndTimeIsNull(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    // =========================================================================
    // Focus score calculation
    // =========================================================================

    /**
     * Calculates a focus score from 0 to 100.
     *
     * <pre>
     *   base     = min(duration / 25.0, 5) × 20      [0–100]
     *   penalty  = distractions × 10
     *   score    = clamp(base − penalty, 0, 100)
     * </pre>
     *
     * @param durationMinutes actual session length in minutes
     * @param distractions    number of self-reported distractions
     * @return integer score between 0 and 100 inclusive
     */
    public static int calculateFocusScore(long durationMinutes, int distractions) {
        double base    = Math.min(durationMinutes / 25.0, 5.0) * 20.0;
        int    penalty = distractions * 10;
        return (int) Math.max(0, Math.min(100, base - penalty));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private FocusSessionResponse toResponse(FocusSession s) {
        boolean active = (s.getEndTime() == null);
        return FocusSessionResponse.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .duration(s.getDuration())
                .distractionCount(s.getDistractionCount())
                .focusScore(s.getFocusScore())
                .focusRating(focusRating(s.getFocusScore()))
                .active(active)
                .build();
    }

    private String focusRating(int score) {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Poor";
    }
}
