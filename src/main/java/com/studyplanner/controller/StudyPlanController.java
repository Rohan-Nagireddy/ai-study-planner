package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.dto.StudyPlanRequest;
import com.studyplanner.dto.StudyPlanResponse;
import com.studyplanner.model.User;
import com.studyplanner.service.GroqAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for AI-powered study plan generation.
 *
 * <p>All endpoints require a valid JWT. The Groq model used is configured via
 * {@code app.groq.model} in {@code application.yml}.</p>
 *
 * <pre>
 * POST /api/ai/generate-study-plan  → generate + store a new study plan
 * GET  /api/ai/study-plans          → list all plans for the current user
 * GET  /api/ai/study-plans/{id}     → fetch a specific plan by ID
 * </pre>
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class StudyPlanController {

    private final GroqAIService groqAIService;

    // =========================================================================
    // Generate
    // =========================================================================

    /**
     * Sends a structured prompt to the Groq API and persists the generated
     * study plan to MongoDB.
     *
     * <p>Sample request:
     * <pre>{@code
     * POST /api/ai/generate-study-plan
     * Authorization: Bearer <token>
     * {
     *   "subjects":        ["Mathematics", "Physics", "Chemistry"],
     *   "examDates":       ["Math: 2026-03-25", "Physics: 2026-03-30"],
     *   "dailyStudyHours": 5,
     *   "weakTopics":      ["Integration", "Thermodynamics"]
     * }
     * }</pre>
     *
     * @param currentUser the JWT principal
     * @param request     validated study plan input
     * @return 201 CREATED with the generated and stored study plan
     */
    @PostMapping("/generate-study-plan")
    public ResponseEntity<ApiResponse<StudyPlanResponse>> generateStudyPlan(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody StudyPlanRequest request) {

        StudyPlanResponse plan =
                groqAIService.generateStudyPlan(currentUser.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Study plan generated successfully", plan));
    }

    // =========================================================================
    // Read
    // =========================================================================

    /**
     * Returns all previously generated study plans for the authenticated user,
     * newest first.
     */
    @GetMapping("/study-plans")
    public ResponseEntity<ApiResponse<List<StudyPlanResponse>>> getUserPlans(
            @AuthenticationPrincipal User currentUser) {

        List<StudyPlanResponse> plans =
                groqAIService.getUserPlans(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    /**
     * Retrieves a specific study plan by its MongoDB ID.
     *
     * @param id the plan's ObjectId string
     * @return 200 OK with the plan, or 404 if not found
     */
    @GetMapping("/study-plans/{id}")
    public ResponseEntity<ApiResponse<StudyPlanResponse>> getPlanById(
            @PathVariable String id) {

        StudyPlanResponse plan = groqAIService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success(plan));
    }
}
