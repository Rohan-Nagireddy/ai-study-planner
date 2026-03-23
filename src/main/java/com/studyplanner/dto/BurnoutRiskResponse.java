package com.studyplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BurnoutRiskResponse {
    private String userId;
    private String name;
    private String email;
    private double averageDailyHoursLast3Days;
    private String riskLevel;
}
