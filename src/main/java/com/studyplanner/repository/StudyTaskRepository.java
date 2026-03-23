package com.studyplanner.repository;

import com.studyplanner.model.StudyTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for {@link StudyTask} documents.
 *
 * <p>All query methods are scoped to a specific user via {@code userId}
 * to enforce data isolation between accounts.</p>
 */
@Repository
public interface StudyTaskRepository extends MongoRepository<StudyTask, String> {

    /**
     * Returns all tasks belonging to the given user, ordered by creation time descending
     * (most recent first).
     */
    List<StudyTask> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Returns un-completed tasks for a user — useful for the active task list view.
     */
    List<StudyTask> findByUserIdAndCompleted(String userId, boolean completed);

    /**
     * Finds a specific task by its id AND userId — prevents users from
     * accessing tasks owned by other users.
     */
    Optional<StudyTask> findByIdAndUserId(String id, String userId);

    /**
     * Counts the total tasks for a user — used for dashboard stats.
     */
    long countByUserId(String userId);

    /**
     * Counts completed tasks for a user — used for completion ratio stats.
     */
    long countByUserIdAndCompleted(String userId, boolean completed);

    /**
     * Finds all tasks created between two timestamps — used by analytics
     * to scope calculations to a day, week, or custom range.
     */
    List<StudyTask> findByUserIdAndCreatedAtBetween(
            String userId,
            java.time.LocalDateTime from,
            java.time.LocalDateTime to
    );

    /**
     * Finds completed tasks within a date range — used for weekly completion stats.
     */
    List<StudyTask> findByUserIdAndCompletedAndCreatedAtBetween(
            String userId,
            boolean completed,
            java.time.LocalDateTime from,
            java.time.LocalDateTime to
    );

    /**
     * Returns all tasks ordered by creation date ascending — used for
     * streak calculation (earliest date first).
     */
    List<StudyTask> findByUserIdOrderByCreatedAtAsc(String userId);
}
