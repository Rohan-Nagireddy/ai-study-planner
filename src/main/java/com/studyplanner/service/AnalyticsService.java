package com.studyplanner.service;

import com.studyplanner.dto.DailyAnalyticsResponse;
import com.studyplanner.dto.StreakResponse;
import com.studyplanner.dto.WeeklyAnalyticsResponse;
import com.studyplanner.model.FocusSession;
import com.studyplanner.model.StudyTask;
import com.studyplanner.repository.FocusSessionRepository;
import com.studyplanner.repository.StudyTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Computes productivity analytics by aggregating data from
 * {@link FocusSession} and {@link StudyTask} MongoDB collections.
 *
 * <h3>Definitions used throughout this service</h3>
 * <ul>
 *   <li><b>Study minutes</b> — sum of {@code duration} from completed focus sessions
 *       (sessions where {@code endTime} is not null)</li>
 *   <li><b>Focus score</b>  — average of {@code focusScore} across completed sessions;
 *       formula: {@code clamp(min(duration/25,5)×20 − distractions×10, 0, 100)}</li>
 *   <li><b>Active study day</b> — any calendar day with ≥1 completed focus session
 *       <em>or</em> ≥1 completed study task</li>
 *   <li><b>Streak</b> — consecutive active days ending today (or yesterday if today
 *       has no activity yet)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final FocusSessionRepository focusSessionRepository;
    private final StudyTaskRepository    studyTaskRepository;

    // =========================================================================
    // Daily analytics
    // =========================================================================

    /**
     * Returns analytics metrics for a single calendar day (defaults to today).
     *
     * @param userId the authenticated user's ID
     * @param date   the calendar date to query (typically {@link LocalDate#now()})
     */
    public DailyAnalyticsResponse getDailyAnalytics(String userId, LocalDate date) {

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd   = date.atTime(LocalTime.MAX);

        // ── Focus sessions ────────────────────────────────────────────────────
        List<FocusSession> sessions = focusSessionRepository
                .findByUserIdAndStartTimeBetween(userId, dayStart, dayEnd)
                .stream()
                .filter(s -> s.getEndTime() != null)   // only completed sessions
                .toList();

        long   totalMinutes   = sessions.stream().mapToLong(FocusSession::getDuration).sum();
        double avgFocusScore  = sessions.stream()
                                        .mapToInt(FocusSession::getFocusScore)
                                        .average()
                                        .orElse(0.0);

        // ── Study tasks ───────────────────────────────────────────────────────
        List<StudyTask> dayTasks = studyTaskRepository
                .findByUserIdAndCreatedAtBetween(userId, dayStart, dayEnd);

        long completedTasks = dayTasks.stream().filter(StudyTask::isCompleted).count();
        long totalTasks     = dayTasks.size();
        double completionRate = totalTasks > 0
                ? Math.round((completedTasks * 100.0 / totalTasks) * 10) / 10.0
                : 0.0;

        return DailyAnalyticsResponse.builder()
                .date(date)
                .totalStudyMinutes(totalMinutes)
                .totalStudyHours(Math.round(totalMinutes / 60.0 * 100) / 100.0)
                .sessionsCompleted(sessions.size())
                .averageFocusScore(Math.round(avgFocusScore * 10) / 10.0)
                .tasksCompleted(completedTasks)
                .totalTasks(totalTasks)
                .taskCompletionRate(completionRate)
                .build();
    }

    // =========================================================================
    // Weekly analytics
    // =========================================================================

    /**
     * Returns aggregated analytics for the past 7 days (today included),
     * with a per-day breakdown for charting.
     *
     * @param userId the authenticated user's ID
     */
    public WeeklyAnalyticsResponse getWeeklyAnalytics(String userId) {

        LocalDate today     = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);   // rolling 7-day window

        // Build one DailyAnalyticsResponse per day
        List<DailyAnalyticsResponse> dailyBreakdown = new ArrayList<>();
        for (LocalDate d = weekStart; !d.isAfter(today); d = d.plusDays(1)) {
            dailyBreakdown.add(getDailyAnalytics(userId, d));
        }

        // Aggregate totals
        long   totalMinutes  = dailyBreakdown.stream()
                                             .mapToLong(DailyAnalyticsResponse::getTotalStudyMinutes)
                                             .sum();
        int    totalSessions = dailyBreakdown.stream()
                                             .mapToInt(DailyAnalyticsResponse::getSessionsCompleted)
                                             .sum();
        double avgFocusScore = dailyBreakdown.stream()
                                             .filter(d -> d.getSessionsCompleted() > 0)
                                             .mapToDouble(DailyAnalyticsResponse::getAverageFocusScore)
                                             .average()
                                             .orElse(0.0);
        long   tasksCompleted = dailyBreakdown.stream()
                                              .mapToLong(DailyAnalyticsResponse::getTasksCompleted)
                                              .sum();
        long   totalTasks     = dailyBreakdown.stream()
                                              .mapToLong(DailyAnalyticsResponse::getTotalTasks)
                                              .sum();
        double completionRate = totalTasks > 0
                ? Math.round((tasksCompleted * 100.0 / totalTasks) * 10) / 10.0
                : 0.0;

        // Most productive day = day with the most study minutes
        LocalDate mostProductiveDay = dailyBreakdown.stream()
                .filter(d -> d.getTotalStudyMinutes() > 0)
                .max(Comparator.comparingLong(DailyAnalyticsResponse::getTotalStudyMinutes))
                .map(DailyAnalyticsResponse::getDate)
                .orElse(null);

        return WeeklyAnalyticsResponse.builder()
                .weekStart(weekStart)
                .weekEnd(today)
                .totalStudyMinutes(totalMinutes)
                .totalStudyHours(Math.round(totalMinutes / 60.0 * 100) / 100.0)
                .totalSessions(totalSessions)
                .averageFocusScore(Math.round(avgFocusScore * 10) / 10.0)
                .tasksCompleted(tasksCompleted)
                .taskCompletionRate(completionRate)
                .dailyBreakdown(dailyBreakdown)
                .mostProductiveDay(mostProductiveDay)
                .build();
    }

    // =========================================================================
    // Streak calculation
    // =========================================================================

    /**
     * Calculates the current and all-time longest study streak for a user.
     *
     * <p>Algorithm:</p>
     * <ol>
     *   <li>Collect all calendar days with ≥1 completed focus session
     *       <em>or</em> ≥1 completed study task into a sorted {@link TreeSet}.</li>
     *   <li>Walk the set in reverse (newest first) counting consecutive days.</li>
     *   <li>Track longest streak seen throughout the full history.</li>
     * </ol>
     *
     * @param userId the authenticated user's ID
     */
    public StreakResponse getStreak(String userId) {

        // ── Collect all "active" dates ────────────────────────────────────────
        Set<LocalDate> activeDays = new TreeSet<>();

        // From focus sessions (completed only)
        focusSessionRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .filter(s -> s.getEndTime() != null)
                .map(s -> s.getStartTime().toLocalDate())
                .forEach(activeDays::add);

        // From completed tasks
        studyTaskRepository.findByUserIdAndCompleted(userId, true)
                .stream()
                .filter(t -> t.getCreatedAt() != null)
                .map(t -> t.getCreatedAt().toLocalDate())
                .forEach(activeDays::add);

        if (activeDays.isEmpty()) {
            return StreakResponse.builder()
                    .currentStreak(0)
                    .longestStreak(0)
                    .studiedToday(false)
                    .totalActiveDays(0)
                    .build();
        }

        // ── Sort descending (newest first) for current-streak walk ────────────
        List<LocalDate> sortedDesc = activeDays.stream()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        LocalDate today         = LocalDate.now();
        boolean   studiedToday  = activeDays.contains(today);

        // Current streak: walk backward from today or yesterday
        int       currentStreak = 0;
        LocalDate cursor        = studiedToday ? today : today.minusDays(1);
        LocalDate streakStart   = null;

        for (LocalDate d : sortedDesc) {
            if (!d.isAfter(cursor)) {
                if (ChronoUnit.DAYS.between(d, cursor) <= 0) {
                    currentStreak++;
                    streakStart = d;
                    cursor      = d.minusDays(1);
                } else {
                    break;   // gap found — streak ends
                }
            }
        }
        // If user didn't study today and yesterday wasn't active, reset
        if (!studiedToday && !activeDays.contains(today.minusDays(1))) {
            currentStreak = 0;
            streakStart   = null;
        }

        // ── Longest streak: full scan ─────────────────────────────────────────
        List<LocalDate> sortedAsc = activeDays.stream()
                .sorted()
                .collect(Collectors.toList());

        int longestStreak = 0;
        int tempStreak    = 1;

        for (int i = 1; i < sortedAsc.size(); i++) {
            long gap = ChronoUnit.DAYS.between(sortedAsc.get(i - 1), sortedAsc.get(i));
            if (gap == 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }
        // Handle single-day case
        longestStreak = Math.max(longestStreak, sortedAsc.isEmpty() ? 0 : 1);
        longestStreak = Math.max(longestStreak, currentStreak);

        return StreakResponse.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .studiedToday(studiedToday)
                .streakStartDate(streakStart)
                .totalActiveDays(activeDays.size())
                .build();
    }
}
