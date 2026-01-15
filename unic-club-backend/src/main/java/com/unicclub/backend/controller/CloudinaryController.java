package com.unicclub.backend.controller;

import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.CloudinaryUploadResponse;
import com.unicclub.backend.dto.response.GalleryImageResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.CloudinaryService;
import com.unicclub.backend.service.GalleryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Controller for Cloudinary image uploads
 * 
 * Handles public image uploads for:
 * - Festival banners
 * - Gallery images
 * - User avatars
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Image Upload", description = "Cloudinary image upload APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class CloudinaryController {
    
    private static final Logger log = LoggerFactory.getLogger(CloudinaryController.class);
    private final CloudinaryService cloudinaryService;
    private final GalleryService galleryService;
    
    @PostMapping("/upload")
    @Operation(summary = "Upload image", description = "Upload an image to a specific folder")
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            CloudinaryUploadResponse response = cloudinaryService.uploadImage(file, folder);
            log.info("Image uploaded by user {}: {}", user.getId(), response.getPublicId());
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image"));
        }
    }
    
    @PostMapping("/festival/{festivalId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Upload festival image", description = "Upload image for a festival (Admin only)")
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadFestivalImage(
            @AuthenticationPrincipal User admin,
            @PathVariable Long festivalId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "year", defaultValue = "2026") Integer year) {
        try {
            CloudinaryUploadResponse response = cloudinaryService.uploadFestivalImage(file, festivalId, year);
            log.info("Festival image uploaded by admin {}: {}", admin.getId(), response.getPublicId());
            return ResponseEntity.ok(ApiResponse.success("Festival image uploaded successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload festival image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image"));
        }
    }
    
    @PostMapping("/gallery")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Upload gallery image", description = "Upload image to gallery and save to database (Admin only)")
    public ResponseEntity<ApiResponse<GalleryUploadResponse>> uploadGalleryImage(
            @AuthenticationPrincipal User admin,
            @RequestParam("file") MultipartFile file,
            @RequestParam("festivalId") Long festivalId,
            @RequestParam(value = "year", defaultValue = "2026") Integer year,
            @RequestParam(value = "eventName", defaultValue = "general") String eventName,
            @RequestParam(value = "caption", required = false) String caption) {
        try {
            // Step 1: Upload to Cloudinary
            CloudinaryUploadResponse cloudinaryResponse = cloudinaryService.uploadGalleryImage(file, year, eventName);
            log.info("Gallery image uploaded to Cloudinary by admin {}: {}", admin.getId(), cloudinaryResponse.getPublicId());
            
            // Step 2: Save record to database
            GalleryImageResponse galleryRecord = galleryService.createImageWithUrl(
                    festivalId,
                    cloudinaryResponse.getUrl(),
                    caption,
                    year,
                    admin
            );
            log.info("Gallery image record saved to database: {}", galleryRecord.getId());
            
            // Return combined response
            GalleryUploadResponse response = new GalleryUploadResponse(cloudinaryResponse, galleryRecord);
            return ResponseEntity.ok(ApiResponse.success("Gallery image uploaded and saved successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload gallery image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image"));
        } catch (Exception e) {
            log.error("Failed to save gallery image record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Image uploaded but failed to save record: " + e.getMessage()));
        }
    }
    
    /**
     * Combined response for gallery upload (Cloudinary + Database record)
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class GalleryUploadResponse {
        private CloudinaryUploadResponse cloudinary;
        private GalleryImageResponse galleryRecord;
    }
    
    @PostMapping("/avatar")
    @Operation(summary = "Upload avatar", description = "Upload user avatar")
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            CloudinaryUploadResponse response = cloudinaryService.uploadAvatar(file, user.getId());
            log.info("Avatar uploaded for user {}: {}", user.getId(), response.getPublicId());
            return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload avatar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload avatar"));
        }
    }
    
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete image", description = "Delete image from Cloudinary (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteImage(
            @AuthenticationPrincipal User admin,
            @PathVariable String publicId) {
        // Decode the publicId (it may contain slashes which are URL encoded)
        String decodedPublicId = publicId.replace("_", "/");
        
        boolean deleted = cloudinaryService.deleteImage(decodedPublicId);
        
        if (deleted) {
            log.info("Image deleted by admin {}: {}", admin.getId(), decodedPublicId);
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", 
                    Map.of("deleted", true)));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Image not found or already deleted"));
        }
    }
    
    @GetMapping("/status")
    @Operation(summary = "Check Cloudinary status", description = "Check if Cloudinary is configured and working")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        boolean configured = cloudinaryService.isConfigured();
        
        Map<String, Object> status = Map.of(
                "configured", configured,
                "message", configured 
                        ? "Cloudinary is configured and ready" 
                        : "Cloudinary is not configured. Check environment variables."
        );
        
        return ResponseEntity.ok(ApiResponse.success(status));
    }
    
    @GetMapping("/transform")
    @Operation(summary = "Generate transformed URL", description = "Generate URL with transformations")
    public ResponseEntity<ApiResponse<Map<String, String>>> getTransformedUrl(
            @RequestParam String publicId,
            @RequestParam(defaultValue = "800") int width,
            @RequestParam(defaultValue = "600") int height) {
        
        String optimizedUrl = cloudinaryService.generateOptimizedUrl(publicId, width, height);
        String thumbnailUrl = cloudinaryService.generateThumbnailUrl(publicId, 300, 300);
        String placeholderUrl = cloudinaryService.generatePlaceholderUrl(publicId);
        
        Map<String, String> urls = Map.of(
                "optimized", optimizedUrl,
                "thumbnail", thumbnailUrl,
                "placeholder", placeholderUrl
        );
        
        return ResponseEntity.ok(ApiResponse.success(urls));
    }
}
