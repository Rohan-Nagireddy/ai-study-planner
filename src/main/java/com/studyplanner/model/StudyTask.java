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
 * StudyTask — a single study task document stored in MongoDB.
 *
 * <p>Every task is owned by a user ({@code userId} stores the owning
 * {@link User#getId()}). Queries must always filter by {@code userId}
 * so users can only see their own tasks.</p>
 *
 * <p>Fields:</p>
 * <ul>
 *   <li>{@code id}            – auto-generated MongoDB ObjectId (String)</li>
 *   <li>{@code userId}        – ID of the owning {@link User} (denormalised ref)</li>
 *   <li>{@code subject}       – subject / topic label (e.g. "Mathematics")</li>
 *   <li>{@code description}   – detailed description of what to study</li>
 *   <li>{@code difficulty}    – 1 = Easy, 2 = Medium, 3 = Hard</li>
 *   <li>{@code estimatedTime} – estimated study time in minutes</li>
 *   <li>{@code completed}     – whether the task has been completed</li>
 *   <li>{@code createdAt}     – auto-set by Spring Data auditing on first save</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_tasks")
public class StudyTask {

    /** MongoDB primary key — ObjectId as a hex String. */
    @Id
    private String id;

    /**
     * ID of the user who owns this task.
     * Indexed for fast per-user queries.
     */
    @Indexed
    private String userId;

    /** Subject or topic label (e.g. "Physics", "Spring Boot"). */
    private String subject;

    /** Detailed description of what needs to be studied. */
    private String description;

    /**
     * Difficulty level:
     * <ul>
     *   <li>1 – Easy</li>
     *   <li>2 – Medium</li>
     *   <li>3 – Hard</li>
     * </ul>
     */
    @Builder.Default
    private int difficulty = 1;

    /** Estimated time to complete this task, in minutes. */
    private int estimatedTime;

    /** Completion status — {@code false} by default for new tasks. */
    @Builder.Default
    private boolean completed = false;

    /**
     * Timestamp of task creation.
     * Populated automatically by {@code @EnableMongoAuditing} in {@link com.studyplanner.config.MongoConfig}.
     */
    @Indexed
    @CreatedDate
    private LocalDateTime createdAt;
}
