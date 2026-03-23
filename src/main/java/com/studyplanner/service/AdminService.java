package com.studyplanner.service;

import com.studyplanner.dto.BurnoutRiskResponse;
import com.studyplanner.dto.PlatformStatsResponse;
import com.studyplanner.model.FocusSession;
import com.studyplanner.model.User;
import com.studyplanner.repository.FocusSessionRepository;
import com.studyplanner.repository.StudyTaskRepository;
import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final FocusSessionRepository focusRepository;
    private final StudyTaskRepository taskRepository;

    public PlatformStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalSessions = focusRepository.count();
        long totalTasks = taskRepository.count();
        
        List<FocusSession> allSessions = focusRepository.findAll();
        double totalHours = allSessions.stream()
                .mapToDouble(FocusSession::getDuration)
                .sum();
        
        double avgFocusScore = allSessions.stream()
                .mapToDouble(FocusSession::getFocusScore)
                .average()
                .orElse(0.0);

        return PlatformStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalFocusSessions(totalSessions)
                .totalStudyTasks(totalTasks)
                .totalStudyHours(totalHours)
                .averageFocusScore((int) avgFocusScore)
                .build();
    }

    public List<BurnoutRiskResponse> getBurnoutRiskUsers() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        List<User> allUsers = userRepository.findAll();
        List<BurnoutRiskResponse> riskUsers = new ArrayList<>();

        for (User user : allUsers) {
            List<FocusSession> recentSessions = focusRepository.findByUserIdAndStartTimeAfter(user.getId(), threeDaysAgo);
            double totalHours = recentSessions.stream()
                    .mapToDouble(FocusSession::getDuration)
                    .sum();
            
            double avgDailyHours = totalHours / 3.0;

            if (avgDailyHours > 8.0) {
                riskUsers.add(BurnoutRiskResponse.builder()
                        .userId(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .averageDailyHoursLast3Days(avgDailyHours)
                        .riskLevel(avgDailyHours > 12 ? "CRITICAL" : "HIGH")
                        .build());
            }
        }

        return riskUsers;
    }
}
