package com.studyplanner.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for creating or updating a {@link com.studyplanner.model.StudyTask}.
 * Validated automatically by Spring via {@code @Valid} in the controller.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyTaskRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    private String description;

    /**
     * Difficulty: 1 = Easy, 2 = Medium, 3 = Hard.
     */
    @Min(value = 1, message = "Difficulty must be between 1 and 3")
    @Max(value = 3, message = "Difficulty must be between 1 and 3")
    private int difficulty = 1;

    /**
     * Estimated time to complete the task, in minutes.
     * Must be a positive number.
     */
    @Positive(message = "Estimated time must be a positive number of minutes")
    private int estimatedTime;

    /** Completion flag — callers can use this on update requests. */
    private boolean completed;
}
