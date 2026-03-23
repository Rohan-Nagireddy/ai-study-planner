package com.studyplanner.repository;

import com.studyplanner.model.BurnoutLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BurnoutLogRepository extends MongoRepository<BurnoutLog, String> {
    List<BurnoutLog> findByUserIdOrderByCreatedAtDesc(String userId);
}
