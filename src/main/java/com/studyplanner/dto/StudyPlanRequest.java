package com.studyplanner.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Request payload for generating an AI study plan.
 * Sent to {@code POST /api/ai/generate-study-plan}.
 */
@Data
public class StudyPlanRequest {

    /**
     * List of subjects to include in the plan.
     * Example: ["Mathematics", "Physics", "Chemistry"]
     */
    @NotEmpty(message = "At least one subject is required")
    private List<String> subjects;

    /**
     * Exam dates (free-form strings) associated with each subject.
     * Example: ["Math exam: 2026-03-25", "Physics exam: 2026-03-30"]
     */
    private List<String> examDates;

    /**
     * How many hours per day the student can dedicate to studying.
     * Clamped between 1 and 16.
     */
    @Min(value = 1,  message = "Daily study hours must be at least 1")
    @Max(value = 16, message = "Daily study hours cannot exceed 16")
    private int dailyStudyHours = 4;

    /**
     * Topics the student finds difficult and wants to focus on.
     * Example: ["Integration", "Thermodynamics"]
     */
    private List<String> weakTopics;
}
