package com.studyplanner.repository;

import com.studyplanner.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findByUserIdOrderByEarnedAtDesc(String userId);
}
