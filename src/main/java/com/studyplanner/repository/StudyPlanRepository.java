package com.studyplanner.repository;

import com.studyplanner.model.StudyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for {@link StudyPlan} documents.
 */
@Repository
public interface StudyPlanRepository extends MongoRepository<StudyPlan, String> {

    /** Returns all plans for a user, newest first. */
    List<StudyPlan> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Returns the most recent plan for a user. */
    java.util.Optional<StudyPlan> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
