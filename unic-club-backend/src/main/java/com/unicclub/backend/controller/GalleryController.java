package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.GalleryImageRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.GalleryImageResponse;
import com.unicclub.backend.dto.response.PageResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.GalleryService;
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
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
@Tag(name = "Gallery", description = "Gallery image management APIs")
public class GalleryController {
    
    private final GalleryService galleryService;
    
    @GetMapping
    @Operation(summary = "Get all gallery images", description = "Get all gallery images ordered by year desc")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getAllImages() {
        List<GalleryImageResponse> images = galleryService.getAllImages();
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/pageable")
    @Operation(summary = "Get all gallery images (pageable)", description = "Get gallery images with pagination support")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageResponse>>> getAllImagesPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageResponse<GalleryImageResponse> images = galleryService.getAllImagesPageable(page, size);
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/year/{year}")
    @Operation(summary = "Get images by year", description = "Get gallery images for a specific year")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getImagesByYear(@PathVariable Integer year) {
        List<GalleryImageResponse> images = galleryService.getImagesByYear(year);
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/year/{year}/pageable")
    @Operation(summary = "Get images by year (pageable)", description = "Get gallery images for a specific year with pagination")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageResponse>>> getImagesByYearPageable(
            @PathVariable Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageResponse<GalleryImageResponse> images = galleryService.getImagesByYearPageable(year, page, size);
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/festival/{festivalId}")
    @Operation(summary = "Get images by festival", description = "Get gallery images for a specific festival")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getImagesByFestival(@PathVariable Long festivalId) {
        List<GalleryImageResponse> images = galleryService.getImagesByFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/festival/{festivalId}/pageable")
    @Operation(summary = "Get images by festival (pageable)", description = "Get gallery images for a specific festival with pagination")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageResponse>>> getImagesByFestivalPageable(
            @PathVariable Long festivalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PageResponse<GalleryImageResponse> images = galleryService.getImagesByFestivalPageable(festivalId, page, size);
        return ResponseEntity.ok(ApiResponse.success(images));
    }
    
    @GetMapping("/years")
    @Operation(summary = "Get distinct years", description = "Get all years that have gallery images")
    public ResponseEntity<ApiResponse<List<Integer>>> getDistinctYears() {
        List<Integer> years = galleryService.getDistinctYears();
        return ResponseEntity.ok(ApiResponse.success(years));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get image by ID", description = "Get a specific gallery image by ID")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> getImageById(@PathVariable Long id) {
        GalleryImageResponse image = galleryService.getImageById(id);
        return ResponseEntity.ok(ApiResponse.success(image));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create gallery image", description = "Create a new gallery image record (Admin only)")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> createImage(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody GalleryImageRequest request) {
        GalleryImageResponse image = galleryService.createImage(request, admin);
        return ResponseEntity.ok(ApiResponse.success("Gallery image created successfully", image));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete gallery image", description = "Delete a gallery image (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        galleryService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Gallery image deleted successfully", null));
    }
}
