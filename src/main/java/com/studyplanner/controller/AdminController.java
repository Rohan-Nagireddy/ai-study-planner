package com.studyplanner.controller;

import com.studyplanner.dto.ApiResponse;
import com.studyplanner.model.User;
import com.studyplanner.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for admin-only user management.
 * All endpoints require {@code ROLE_ADMIN}.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final com.studyplanner.service.AdminService adminService;

    /** Returns all registered users — admin dashboard data. */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAll()));
    }

    /** Returns platform-wide statistics. */
    @GetMapping("/platform-stats")
    public ResponseEntity<ApiResponse<com.studyplanner.dto.PlatformStatsResponse>> getPlatformStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPlatformStats()));
    }

    /** Returns users identified as being at burnout risk. */
    @GetMapping("/burnout-risk")
    public ResponseEntity<ApiResponse<List<com.studyplanner.dto.BurnoutRiskResponse>>> getBurnoutRisk() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBurnoutRiskUsers()));
    }

    /** Deletes a user by their MongoDB string ID. */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal User admin) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }
}
