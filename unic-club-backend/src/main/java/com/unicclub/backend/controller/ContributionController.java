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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
@Tag(name = "Contributions", description = "Contribution management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class ContributionController {
    
    private static final Logger log = LoggerFactory.getLogger(ContributionController.class);
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
    
    // ========== Secure Payment Proof Image Endpoints ==========
    
    @PostMapping("/{id}/proof")
    @Operation(summary = "Upload payment proof", description = "Upload payment proof image for your contribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadProofImage(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            contributionService.uploadProofImage(id, user.getId(), file);
            log.info("Payment proof uploaded for contribution {} by user {}", id, user.getId());
            
            Map<String, Object> data = Map.of(
                    "contributionId", id,
                    "fileName", file.getOriginalFilename(),
                    "fileSize", file.getSize(),
                    "contentType", file.getContentType()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Payment proof uploaded successfully", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload proof image for contribution {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image"));
        }
    }
    
    @PostMapping("/{id}/proof/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Upload payment proof (Admin)", description = "Admin can upload payment proof for any contribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadProofImageByAdmin(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            contributionService.uploadProofImageByAdmin(id, file);
            log.info("Payment proof uploaded by admin {} for contribution {}", admin.getId(), id);
            
            Map<String, Object> data = Map.of(
                    "contributionId", id,
                    "fileName", file.getOriginalFilename(),
                    "fileSize", file.getSize(),
                    "contentType", file.getContentType()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Payment proof uploaded successfully", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload proof image for contribution {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image"));
        }
    }
    
    @GetMapping("/{id}/proof")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or @contributionService.isOwner(#id, principal.id)")
    @Operation(summary = "View payment proof", description = "View payment proof image (Admin or owner only)")
    public ResponseEntity<byte[]> getProofImage(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            if (!contributionService.hasProofImage(id)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageData = contributionService.getProofImageData(id);
            String contentType = contributionService.getProofImageType(id);
            String fileName = contributionService.getProofImageName(id);
            
            log.info("Payment proof viewed for contribution {} by user {}", id, user.getId());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600") // Cache for 1 hour
                    .body(imageData);
        } catch (Exception e) {
            log.error("Failed to retrieve proof image for contribution {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/proof/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or @contributionService.isOwner(#id, principal.id)")
    @Operation(summary = "Download payment proof", description = "Download payment proof image (Admin or owner only)")
    public ResponseEntity<byte[]> downloadProofImage(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            if (!contributionService.hasProofImage(id)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageData = contributionService.getProofImageData(id);
            String contentType = contributionService.getProofImageType(id);
            String fileName = contributionService.getProofImageName(id);
            
            log.info("Payment proof downloaded for contribution {} by user {}", id, user.getId());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(imageData);
        } catch (Exception e) {
            log.error("Failed to download proof image for contribution {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}/proof")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete payment proof", description = "Delete payment proof image (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProofImage(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id) {
        try {
            contributionService.deleteProofImage(id);
            log.info("Payment proof deleted for contribution {} by admin {}", id, admin.getId());
            return ResponseEntity.ok(ApiResponse.success("Payment proof deleted successfully", null));
        } catch (Exception e) {
            log.error("Failed to delete proof image for contribution {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete image"));
        }
    }
    
    @GetMapping("/{id}/proof/check")
    @Operation(summary = "Check if proof exists", description = "Check if payment proof image exists for a contribution")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> hasProofImage(@PathVariable Long id) {
        boolean hasProof = contributionService.hasProofImage(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasProofImage", hasProof)));
    }
}


