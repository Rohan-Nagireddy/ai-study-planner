package com.studyplanner.dto;

import lombok.Data;

/**
 * Optional request body for starting a focus session.
 * Kept simple so the client can POST with an empty body if desired.
 */
@Data
public class StartSessionRequest {

    /**
     * Optional note describing the focus goal for this session.
     * Example: "Chapter 5 — Integration by parts"
     */
    private String note;
}
