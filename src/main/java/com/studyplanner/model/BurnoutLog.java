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
 * BurnoutLog — Tracks user well-being metrics to detect burnout risk.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "burnoutLogs")
public class BurnoutLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String burnoutRiskLevel; // Low, Medium, High
    private double studyHours;
    private double sleepHours;
    private int moodRating; // 1-10

    @Indexed
    @CreatedDate
    private LocalDateTime createdAt;
}
