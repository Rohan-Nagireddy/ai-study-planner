package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Study streak analytics.
 * Returned by {@code GET /api/analytics/streak}.
 *
 * <p>A "study day" is any calendar day that has at least one completed
 * focus session OR at least one completed study task.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreakResponse {

    /**
     * Number of consecutive days (ending today) with study activity.
     * Resets to 0 if today has no activity.
     */
    private int currentStreak;

    /**
     * The longest streak the user has ever achieved (all-time high).
     */
    private int longestStreak;

    /**
     * Whether the user has already studied today (streak is "live").
     */
    private boolean studiedToday;

    /**
     * First date in the current consecutive streak.
     * {@code null} if currentStreak == 0.
     */
    private LocalDate streakStartDate;

    /**
     * Total number of distinct days on which the user studied (lifetime).
     */
    private long totalActiveDays;
}
