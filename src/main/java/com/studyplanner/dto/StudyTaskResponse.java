package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for a {@link com.studyplanner.model.StudyTask}.
 * Returned from all task endpoints to avoid exposing the internal model directly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyTaskResponse {

    private String         id;
    private String         userId;
    private String         subject;
    private String         description;
    private int            difficulty;
    private String         difficultyLabel; // "Easy" | "Medium" | "Hard"
    private int            estimatedTime;
    private boolean        completed;
    private LocalDateTime  createdAt;
}
