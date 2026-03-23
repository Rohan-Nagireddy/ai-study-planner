package com.studyplanner.service;

import com.studyplanner.dto.StudyTaskRequest;
import com.studyplanner.dto.StudyTaskResponse;
import com.studyplanner.model.StudyTask;
import com.studyplanner.repository.StudyTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Business logic for study task management.
 *
 * <p>Ownership is enforced at every operation — tasks are always
 * fetched with both {@code id} and {@code userId} so one user cannot
 * read, modify, or delete another user's tasks.</p>
 */
@Service
@RequiredArgsConstructor
public class StudyTaskService {

    private final StudyTaskRepository studyTaskRepository;

    // =========================================================================
    // Create
    // =========================================================================

    /**
     * Creates a new task owned by the given user.
     *
     * @param userId  the ID of the authenticated user
     * @param request the task payload
     * @return the persisted task as a response DTO
     */
    public StudyTaskResponse createTask(String userId, StudyTaskRequest request) {
        StudyTask task = StudyTask.builder()
                .userId(userId)
                .subject(request.getSubject())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .estimatedTime(request.getEstimatedTime())
                .completed(false)
                .build();

        return toResponse(studyTaskRepository.save(task));
    }

    // =========================================================================
    // Read
    // =========================================================================

    /**
     * Returns all tasks belonging to the user, newest first.
     */
    public List<StudyTaskResponse> getUserTasks(String userId) {
        return studyTaskRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns only pending (not-yet-completed) tasks for the user.
     */
    public List<StudyTaskResponse> getPendingTasks(String userId) {
        return studyTaskRepository
                .findByUserIdAndCompleted(userId, false)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a single task by ID, scoped to the authenticated user.
     *
     * @throws NoSuchElementException if the task does not exist
     * @throws AccessDeniedException  if the task belongs to a different user
     */
    public StudyTaskResponse getTaskById(String taskId, String userId) {
        return toResponse(findOwnedTask(taskId, userId));
    }

    // =========================================================================
    // Update
    // =========================================================================

    /**
     * Updates a task owned by the given user.
     *
     * @param taskId  the ID of the task to update
     * @param userId  the ID of the authenticated user
     * @param request the updated payload
     * @return the updated task as a response DTO
     * @throws NoSuchElementException if the task does not exist for this user
     */
    public StudyTaskResponse updateTask(String taskId, String userId, StudyTaskRequest request) {
        StudyTask task = findOwnedTask(taskId, userId);

        task.setSubject(request.getSubject());
        task.setDescription(request.getDescription());
        task.setDifficulty(request.getDifficulty());
        task.setEstimatedTime(request.getEstimatedTime());
        task.setCompleted(request.isCompleted());

        return toResponse(studyTaskRepository.save(task));
    }

    /**
     * Marks a task as completed without replacing other fields.
     *
     * @param taskId the ID of the task to mark complete
     * @param userId the ID of the authenticated user
     */
    public StudyTaskResponse markCompleted(String taskId, String userId) {
        StudyTask task = findOwnedTask(taskId, userId);
        task.setCompleted(true);
        return toResponse(studyTaskRepository.save(task));
    }

    // =========================================================================
    // Delete
    // =========================================================================

    /**
     * Permanently deletes a task owned by the given user.
     *
     * @throws NoSuchElementException if the task does not exist for this user
     */
    public void deleteTask(String taskId, String userId) {
        StudyTask task = findOwnedTask(taskId, userId);
        studyTaskRepository.delete(task);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /**
     * Loads a task by its id AND userId — the dual-key lookup guarantees that
     * users can never access tasks that belong to another account.
     */
    private StudyTask findOwnedTask(String taskId, String userId) {
        return studyTaskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Task not found with id: " + taskId));
    }

    /** Maps a {@link StudyTask} document to a {@link StudyTaskResponse} DTO. */
    private StudyTaskResponse toResponse(StudyTask task) {
        return StudyTaskResponse.builder()
                .id(task.getId())
                .userId(task.getUserId())
                .subject(task.getSubject())
                .description(task.getDescription())
                .difficulty(task.getDifficulty())
                .difficultyLabel(difficultyLabel(task.getDifficulty()))
                .estimatedTime(task.getEstimatedTime())
                .completed(task.isCompleted())
                .createdAt(task.getCreatedAt())
                .build();
    }

    private String difficultyLabel(int difficulty) {
        return switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Medium";
            case 3 -> "Hard";
            default -> "Unknown";
        };
    }
}
