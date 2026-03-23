package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Aggregated analytics metrics for a 7-day week window.
 * Returned by {@code GET /api/analytics/weekly}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAnalyticsResponse {

    /** Start of the 7-day window (Monday or 7 days ago). */
    private LocalDate weekStart;

    /** End of the 7-day window (today). */
    private LocalDate weekEnd;

    /** Total study minutes across the entire week. */
    private long totalStudyMinutes;

    /** Equivalent hours (rounded). */
    private double totalStudyHours;

    /** Total completed focus sessions this week. */
    private int totalSessions;

    /** Weekly average focus score (0–100). */
    private double averageFocusScore;

    /** Total tasks completed this week. */
    private long tasksCompleted;

    /** Task completion rate across the week (%). */
    private double taskCompletionRate;

    /**
     * Day-by-day breakdown — one entry per calendar day in the week window.
     * Allows the frontend to render a bar/line chart.
     */
    private List<DailyAnalyticsResponse> dailyBreakdown;

    /**
     * Most productive day of the week (highest study minutes).
     * {@code null} if no sessions recorded.
     */
    private LocalDate mostProductiveDay;
}
