package com.studyplanner.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * Request body for ending an active focus session.
 * The client reports how many distractions occurred during the session.
 */
@Data
public class EndSessionRequest {

    /**
     * Number of self-reported distractions during the session.
     * Must be 0 or greater.
     */
    @Min(value = 0, message = "Distraction count cannot be negative")
    private int distractionCount;
}
