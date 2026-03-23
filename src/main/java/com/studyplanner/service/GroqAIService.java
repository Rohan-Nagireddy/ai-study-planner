package com.studyplanner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.client.GroqAPIClient;
import com.studyplanner.config.GroqProperties;
import com.studyplanner.dto.StudyPlanRequest;
import com.studyplanner.dto.StudyPlanResponse;
import com.studyplanner.model.StudyPlan;
import com.studyplanner.repository.StudyPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Orchestrates study plan generation by constructing prompts, calling Groq,
 * and persisting the results.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroqAIService {

    private final GroqAPIClient       groqAPIClient;
    private final GroqProperties      groqProperties;
    private final StudyPlanRepository studyPlanRepository;
    private final ObjectMapper        objectMapper;

    /**
     * Generates a study plan for the student.
     */
    public StudyPlanResponse generateStudyPlan(String userId, StudyPlanRequest request) {
        String systemPrompt = "You are an expert AI Study Planner. Your goal is to help students maximize their productivity. "
                + "Always respond with ONLY a valid JSON object — no markdown, no conversational filler.";
        
        String userPrompt = buildUserPrompt(request);
        
        log.info("Generating study plan for user: {}", userId);
        String rawResponse = groqAPIClient.getChatCompletion(systemPrompt, userPrompt);
        
        StudyPlan plan = parseAndPersist(userId, request, rawResponse);
        return toResponse(plan);
    }

    private String buildUserPrompt(StudyPlanRequest req) {
        String subjects   = String.join(", ", req.getSubjects());
        String examDates  = (req.getExamDates() != null) ? String.join(", ", req.getExamDates()) : "Not set";
        String weakTopics = (req.getWeakTopics() != null) ? String.join(", ", req.getWeakTopics()) : "None";

        return String.format("""
                Create a personalized study plan based on:
                - Subjects: %s
                - Exam Dates: %s
                - Daily Study Hours: %d
                - Weak Topics: %s
                
                You must generate:
                1. A daily study schedule
                2. Topic prioritization (rank what to study first)
                3. A revision plan
                4. Practical study tips
                5. A brief motivation message
                
                Respond ONLY with this JSON structure:
                {
                  "dailySchedule": ["..."],
                  "priorityTopics": ["rank topics based on urgency and weak areas"],
                  "revisionPlan": ["strategy for retention and review"],
                  "motivationTips": ["practical study tips and a brief motivation message"]
                }
                """, 
                subjects, examDates, req.getDailyStudyHours(), weakTopics);
    }

    private StudyPlan parseAndPersist(String userId, StudyPlanRequest req, String rawContent) {
        List<String> dailySchedule  = List.of("Parse failed");
        List<String> priorityTopics = List.of("Parse failed");
        List<String> revisionPlan   = List.of("Parse failed");
        List<String> motivationTips = List.of("Parse failed");

        String json = rawContent.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();

        try {
            JsonNode root = objectMapper.readTree(json);
            dailySchedule  = parseArray(root, "dailySchedule");
            priorityTopics = parseArray(root, "priorityTopics");
            revisionPlan   = parseArray(root, "revisionPlan");
            motivationTips = parseArray(root, "motivationTips");
        } catch (Exception e) {
            log.error("Failed to parse LLM response: {}", e.getMessage());
        }

        StudyPlan plan = StudyPlan.builder()
                .userId(userId)
                .subjects(req.getSubjects())
                .examDates(req.getExamDates())
                .dailyStudyHours(req.getDailyStudyHours())
                .weakTopics(req.getWeakTopics())
                .dailySchedule(dailySchedule)
                .priorityTopics(priorityTopics)
                .revisionPlan(revisionPlan)
                .motivationTips(motivationTips)
                .rawResponse(rawContent)
                .modelUsed(groqProperties.getModel())
                .build();

        return studyPlanRepository.save(plan);
    }

    private List<String> parseArray(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isArray()) {
            List<String> list = new java.util.ArrayList<>();
            node.forEach(n -> list.add(n.asText()));
            return list;
        }
        return List.of(node.asText());
    }

    public List<StudyPlanResponse> getUserPlans(String userId) {
        return studyPlanRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public StudyPlanResponse getPlanById(String planId) {
        StudyPlan plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new NoSuchElementException("Plan not found: " + planId));
        return toResponse(plan);
    }

    private StudyPlanResponse toResponse(StudyPlan p) {
        return StudyPlanResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .subjects(p.getSubjects())
                .examDates(p.getExamDates())
                .dailyStudyHours(p.getDailyStudyHours())
                .weakTopics(p.getWeakTopics())
                .dailySchedule(p.getDailySchedule())
                .priorityTopics(p.getPriorityTopics())
                .revisionPlan(p.getRevisionPlan())
                .motivationTips(p.getMotivationTips())
                .modelUsed(p.getModelUsed())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
