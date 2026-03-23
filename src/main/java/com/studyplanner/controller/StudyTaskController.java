package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.dto.StudyTaskRequest;
import com.studyplanner.dto.StudyTaskResponse;
import com.studyplanner.model.User;
import com.studyplanner.service.StudyTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for study task management.
 *
 * <p>All endpoints require a valid JWT ({@code Authorization: Bearer <token>}).
 * The authenticated user is resolved via {@link AuthenticationPrincipal} — no manual
 * token parsing needed in the controller layer.</p>
 *
 * <pre>
 * POST   /api/tasks           → create task
 * GET    /api/tasks           → get all user tasks
 * GET    /api/tasks/{id}      → get single task
 * PUT    /api/tasks/{id}      → full update
 * PATCH  /api/tasks/{id}/complete → mark as completed
 * DELETE /api/tasks/{id}      → delete task
 * </pre>
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class StudyTaskController {

    private final StudyTaskService studyTaskService;

    // =========================================================================
    // Create
    // =========================================================================

    /**
     * Creates a new study task for the authenticated user.
     *
     * <p>Sample request:
     * <pre>{@code
     * POST /api/tasks
     * {
     *   "subject": "Mathematics",
     *   "description": "Chapter 5 — Integration",
     *   "difficulty": 2,
     *   "estimatedTime": 90
     * }
     * }</pre>
     *
     * @param currentUser the Principal resolved from the JWT
     * @param request     validated task payload
     * @return 201 CREATED with the saved task
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StudyTaskResponse>> createTask(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody StudyTaskRequest request) {

        log.info("Creating task for user: {}, Request: {}", 
                (currentUser != null ? currentUser.getEmail() : "NULL"), request);
        
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        try {
            StudyTaskResponse created = studyTaskService.createTask(currentUser.getId(), request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Task created successfully", created));
        } catch (Exception e) {
            log.error("Failed to create task", e);
            throw e;
        }
    }

    // =========================================================================
    // Read
    // =========================================================================

    /**
     * Returns all tasks belonging to the authenticated user, newest first.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyTaskResponse>>> getUserTasks(
            @AuthenticationPrincipal User currentUser) {

        List<StudyTaskResponse> tasks = studyTaskService.getUserTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * Returns a single task by ID.
     * Returns 404 if the task does not exist or belongs to another user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyTaskResponse>> getTaskById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String id) {

        StudyTaskResponse task = studyTaskService.getTaskById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    // =========================================================================
    // Update
    // =========================================================================

    /**
     * Fully replaces a task's fields with the request body.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyTaskResponse>> updateTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String id,
            @Valid @RequestBody StudyTaskRequest request) {

        StudyTaskResponse updated = studyTaskService.updateTask(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", updated));
    }

    /**
     * Marks a task as completed without modifying other fields.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<StudyTaskResponse>> markCompleted(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String id) {

        StudyTaskResponse updated = studyTaskService.markCompleted(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Task marked as completed", updated));
    }

    // =========================================================================
    // Delete
    // =========================================================================

    /**
     * Permanently deletes a task owned by the authenticated user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String id) {

        studyTaskService.deleteTask(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
