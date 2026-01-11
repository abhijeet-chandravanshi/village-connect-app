package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.ContributionRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.ContributionResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.ContributionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
@Tag(name = "Contributions", description = "Contribution management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class ContributionController {
    
    private final ContributionService contributionService;
    
    @PostMapping
    @Operation(summary = "Create contribution", description = "Submit a new contribution")
    public ResponseEntity<ApiResponse<ContributionResponse>> createContribution(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ContributionRequest request) {
        ContributionResponse contribution = contributionService.createContribution(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Contribution submitted successfully", contribution));
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get my contributions", description = "Get all contributions by the current user")
    public ResponseEntity<ApiResponse<List<ContributionResponse>>> getMyContributions(@AuthenticationPrincipal User user) {
        List<ContributionResponse> contributions = contributionService.getUserContributions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(contributions));
    }
    
    @GetMapping("/festival/{festivalId}")
    @Operation(summary = "Get festival contributions", description = "Get all contributions for a festival")
    public ResponseEntity<ApiResponse<List<ContributionResponse>>> getFestivalContributions(@PathVariable Long festivalId) {
        List<ContributionResponse> contributions = contributionService.getFestivalContributions(festivalId);
        return ResponseEntity.ok(ApiResponse.success(contributions));
    }
    
    @GetMapping("/festival/{festivalId}/verified")
    @Operation(summary = "Get verified contributions", description = "Get verified contributions for a festival")
    public ResponseEntity<ApiResponse<List<ContributionResponse>>> getFestivalVerifiedContributions(@PathVariable Long festivalId) {
        List<ContributionResponse> contributions = contributionService.getFestivalVerifiedContributions(festivalId);
        return ResponseEntity.ok(ApiResponse.success(contributions));
    }
    
    @GetMapping("/recent")
    @Operation(summary = "Get recent contributions", description = "Get recent contributions (limit 10)")
    public ResponseEntity<ApiResponse<List<ContributionResponse>>> getRecentContributions() {
        List<ContributionResponse> contributions = contributionService.getRecentContributions();
        return ResponseEntity.ok(ApiResponse.success(contributions));
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get pending contributions", description = "Get all pending contributions (Admin only)")
    public ResponseEntity<ApiResponse<List<ContributionResponse>>> getPendingContributions() {
        List<ContributionResponse> contributions = contributionService.getPendingContributions();
        return ResponseEntity.ok(ApiResponse.success(contributions));
    }
    
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Verify contribution", description = "Verify a pending contribution (Admin only)")
    public ResponseEntity<ApiResponse<ContributionResponse>> verifyContribution(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id) {
        ContributionResponse contribution = contributionService.verifyContribution(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Contribution verified successfully", contribution));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Reject contribution", description = "Reject a pending contribution (Admin only)")
    public ResponseEntity<ApiResponse<ContributionResponse>> rejectContribution(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        ContributionResponse contribution = contributionService.rejectContribution(id, admin.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Contribution rejected", contribution));
    }
}


