package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned by {@code POST /api/ai/generate-study-plan}.
 * Mirrors the {@link com.studyplanner.model.StudyPlan} document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPlanResponse {

    private String         id;
    private String         userId;

    // Echo inputs
    private List<String>   subjects;
    private List<String>   examDates;
    private int            dailyStudyHours;
    private List<String>   weakTopics;

    // AI outputs
    private List<String>   dailySchedule;
    private List<String>   revisionPlan;
    private List<String>   priorityTopics;
    private List<String>   motivationTips;

    private String         modelUsed;
    private LocalDateTime  createdAt;
}
