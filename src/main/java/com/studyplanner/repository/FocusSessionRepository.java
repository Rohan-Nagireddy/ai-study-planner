package com.studyplanner.repository;

import com.studyplanner.model.FocusSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB repository for {@link FocusSession} documents.
 * All queries are scoped to a {@code userId} for data isolation.
 */
@Repository
public interface FocusSessionRepository extends MongoRepository<FocusSession, String> {

    /**
     * Returns the full session history for a user, newest first.
     */
    List<FocusSession> findByUserIdOrderByStartTimeDesc(String userId);

    /**
     * Finds any session that is still active (endTime is null) for the given user.
     * A user should have at most one active session at a time.
     */
    Optional<FocusSession> findByUserIdAndEndTimeIsNull(String userId);

    /**
     * Finds completed sessions within a date range — useful for weekly/monthly stats.
     */
    List<FocusSession> findByUserIdAndStartTimeBetween(
            String userId,
            LocalDateTime from,
            LocalDateTime to
    );

    /**
     * Counts total sessions for a user — used on the dashboard.
     */
    long countByUserId(String userId);

    /**
     * Finds a specific session by id + userId (ownership guard).
     */
    Optional<FocusSession> findByIdAndUserId(String id, String userId);

    /**
     * Finds sessions for a user started after a specific timestamp.
     * Used for burnout risk detection.
     */
    List<FocusSession> findByUserIdAndStartTimeAfter(String userId, LocalDateTime startTime);
}
