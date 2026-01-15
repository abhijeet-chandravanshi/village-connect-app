package com.unicclub.backend.controller;

import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.UserResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.ContributionService;
import com.unicclub.backend.service.FestivalService;
import com.unicclub.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {
    
    private final UserService userService;
    private final FestivalService festivalService;
    private final ContributionService contributionService;
    
    @GetMapping("/stats")
    @Operation(summary = "Get dashboard stats", description = "Get statistics for admin dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", userService.countActiveUsers());
        stats.put("totalFestivals", festivalService.getAllFestivals().size());
        stats.put("pendingContributions", contributionService.countPendingContributions());
        stats.put("activeFestivals", festivalService.getActiveFestivals().size());
        stats.put("totalCollection", festivalService.getTotalVerifiedCollection());
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/members")
    @Operation(summary = "Get all members", description = "Get all members list")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllMembers() {
        List<UserResponse> members = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(members));
    }
    
    @PutMapping("/members/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update member role", description = "Update a member's role (Super Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> updateMemberRole(
            @PathVariable Long id,
            @RequestParam String role) {
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        UserResponse user = userService.updateRole(id, userRole);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", user));
    }
}


