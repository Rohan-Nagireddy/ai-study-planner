package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Analytics metrics for a single calendar day.
 * Returned by {@code GET /api/analytics/daily}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyAnalyticsResponse {

    /** The date this snapshot covers. */
    private LocalDate date;

    /** Total completed focus session time for the day, in minutes. */
    private long totalStudyMinutes;

    /** Equivalent in hours (rounded to 2 decimal places). */
    private double totalStudyHours;

    /** Number of focus sessions completed during the day. */
    private int sessionsCompleted;

    /** Average focus score across all completed sessions (0–100). */
    private double averageFocusScore;

    /** Number of study tasks completed during the day. */
    private long tasksCompleted;

    /** Total tasks created during the day (completed + pending). */
    private long totalTasks;

    /** Task completion rate as a percentage (0–100). */
    private double taskCompletionRate;
}
