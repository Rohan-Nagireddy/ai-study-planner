package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatsResponse {
    private long totalUsers;
    private long totalFocusSessions;
    private long totalStudyTasks;
    private double totalStudyHours;
    private int averageFocusScore;
}
