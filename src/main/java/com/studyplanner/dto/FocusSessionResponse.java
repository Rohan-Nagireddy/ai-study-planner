package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for a {@link com.studyplanner.model.FocusSession}.
 * Includes a human-readable focus rating derived from {@code focusScore}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusSessionResponse {

    private String        id;
    private String        userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /** Duration in minutes. 0 if the session is still active. */
    private long   duration;

    /** Distractions reported by the user. */
    private int    distractionCount;

    /** Computed focus score: 0–100. */
    private int    focusScore;

    /**
     * Human-readable label derived from {@code focusScore}:
     * <ul>
     *   <li>80–100 → "Excellent"</li>
     *   <li>60–79  → "Good"</li>
     *   <li>40–59  → "Fair"</li>
     *   <li>0–39   → "Poor"</li>
     * </ul>
     */
    private String focusRating;

    /** {@code true} if the session has not yet been ended. */
    private boolean active;
}
