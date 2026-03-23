package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.dto.DailyAnalyticsResponse;
import com.studyplanner.dto.StreakResponse;
import com.studyplanner.dto.WeeklyAnalyticsResponse;
import com.studyplanner.model.User;
import com.studyplanner.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * REST controller for productivity analytics.
 *
 * <p>All endpoints require a valid JWT. The authenticated user's ID is resolved
 * via {@link AuthenticationPrincipal} — no manual token parsing needed.</p>
 *
 * <pre>
 * GET /api/analytics/daily    → today's or a specified date's metrics
 * GET /api/analytics/weekly   → rolling 7-day aggregated metrics + daily breakdown
 * GET /api/analytics/streak   → current streak, longest streak, lifetime active days
 * </pre>
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // =========================================================================
    // Daily
    // =========================================================================

    /**
     * Returns productivity metrics for a single calendar day.
     *
     * <p>If no {@code date} parameter is supplied, defaults to today.</p>
     *
     * <p>Sample responses:
     * <pre>{@code
     * GET /api/analytics/daily
     * GET /api/analytics/daily?date=2026-03-15
     * }</pre>
     *
     * @param currentUser the JWT principal
     * @param date        optional date in {@code yyyy-MM-dd} format (defaults to today)
     * @return daily analytics snapshot
     */
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyAnalyticsResponse>> getDailyAnalytics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        LocalDate target = (date != null) ? date : LocalDate.now();
        DailyAnalyticsResponse daily =
                analyticsService.getDailyAnalytics(currentUser.getId(), target);

        return ResponseEntity.ok(ApiResponse.success(
                "Daily analytics for " + target, daily));
    }

    // =========================================================================
    // Weekly
    // =========================================================================

    /**
     * Returns aggregated productivity metrics for the past 7 days,
     * including a per-day breakdown suitable for rendering a chart.
     *
     * <pre>{@code
     * GET /api/analytics/weekly
     * }</pre>
     *
     * @param currentUser the JWT principal
     * @return weekly analytics with daily breakdown and most-productive-day
     */
    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsResponse>> getWeeklyAnalytics(
            @AuthenticationPrincipal User currentUser) {

        WeeklyAnalyticsResponse weekly =
                analyticsService.getWeeklyAnalytics(currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success(
                "Weekly analytics (" + weekly.getWeekStart()
                + " → " + weekly.getWeekEnd() + ")", weekly));
    }

    // =========================================================================
    // Streak
    // =========================================================================

    /**
     * Returns the user's current study streak, all-time longest streak,
     * whether they've studied today, and total lifetime active days.
     *
     * <p>An "active day" = any day with ≥1 completed focus session
     * or ≥1 completed study task.</p>
     *
     * <pre>{@code
     * GET /api/analytics/streak
     * }</pre>
     *
     * @param currentUser the JWT principal
     * @return streak analytics
     */
    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StreakResponse>> getStreak(
            @AuthenticationPrincipal User currentUser) {

        StreakResponse streak = analyticsService.getStreak(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Study streak", streak));
    }
}
