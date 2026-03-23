package com.studyplanner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * FocusSession — records a single Pomodoro-style focus session.
 *
 * <p>Lifecycle:</p>
 * <ol>
 *   <li>Client calls {@code POST /api/focus/start} → document created with
 *       {@code startTime} set, {@code endTime = null}.</li>
 *   <li>Client calls {@code POST /api/focus/{id}/end} → {@code endTime},
 *       {@code duration}, and {@code focusScore} are calculated and persisted.</li>
 * </ol>
 *
 * <h3>Focus Score formula</h3>
 * <pre>
 *   baseScore   = min(duration / 25, 5) × 20        (up to 100 pts for 25+ min sessions)
 *   penalty     = distractionCount × 10               (−10 per distraction)
 *   focusScore  = max(0, baseScore − penalty)         (floor at 0)
 * </pre>
 *
 * Fields:
 * <ul>
 *   <li>{@code id}               – MongoDB ObjectId</li>
 *   <li>{@code userId}           – owning user (indexed)</li>
 *   <li>{@code startTime}        – session start timestamp</li>
 *   <li>{@code endTime}          – session end timestamp (null while active)</li>
 *   <li>{@code duration}         – elapsed minutes (0 while active)</li>
 *   <li>{@code distractionCount} – number of distractions logged by the user</li>
 *   <li>{@code focusScore}       – 0–100 computed score</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "focus_sessions")
public class FocusSession {

    @Id
    private String id;

    /** ID of the user who owns this session. Indexed for fast per-user queries. */
    @Indexed
    private String userId;

    /** Timestamp when the session was started. */
    private LocalDateTime startTime;

    /**
     * Timestamp when the session ended.
     * {@code null} while the session is still active.
     */
    private LocalDateTime endTime;

    /**
     * Actual session duration in minutes.
     * Calculated when the session is ended.
     */
    @Builder.Default
    private long duration = 0;

    /**
     * Number of times the user self-reported a distraction during the session.
     * Provided by the client on {@code end} request.
     */
    @Builder.Default
    private int distractionCount = 0;

    /**
     * Focus quality score from 0 to 100.
     * Calculated server-side when the session ends.
     */
    @Builder.Default
    private int focusScore = 0;

    @Indexed
    @CreatedDate
    private LocalDateTime createdAt;
}
