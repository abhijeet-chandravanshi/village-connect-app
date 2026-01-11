package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.FestivalRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.FestivalResponse;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.service.FestivalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
@Tag(name = "Festivals", description = "Festival management APIs")
public class FestivalController {
    
    private final FestivalService festivalService;
    
    @GetMapping
    @Operation(summary = "Get all festivals", description = "Get all festivals ordered by year")
    public ResponseEntity<ApiResponse<List<FestivalResponse>>> getAllFestivals() {
        List<FestivalResponse> festivals = festivalService.getAllFestivals();
        return ResponseEntity.ok(ApiResponse.success(festivals));
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get active festivals", description = "Get upcoming and ongoing festivals")
    public ResponseEntity<ApiResponse<List<FestivalResponse>>> getActiveFestivals() {
        List<FestivalResponse> festivals = festivalService.getActiveFestivals();
        return ResponseEntity.ok(ApiResponse.success(festivals));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get festival by ID", description = "Get a specific festival by its ID")
    public ResponseEntity<ApiResponse<FestivalResponse>> getFestivalById(@PathVariable Long id) {
        FestivalResponse festival = festivalService.getFestivalById(id);
        return ResponseEntity.ok(ApiResponse.success(festival));
    }
    
    @GetMapping("/year/{year}")
    @Operation(summary = "Get festivals by year", description = "Get all festivals for a specific year")
    public ResponseEntity<ApiResponse<List<FestivalResponse>>> getFestivalsByYear(@PathVariable Integer year) {
        List<FestivalResponse> festivals = festivalService.getFestivalsByYear(year);
        return ResponseEntity.ok(ApiResponse.success(festivals));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get festivals by status", description = "Get festivals by status (UPCOMING, ONGOING, COMPLETED)")
    public ResponseEntity<ApiResponse<List<FestivalResponse>>> getFestivalsByStatus(@PathVariable String status) {
        Festival.Status festivalStatus = Festival.Status.valueOf(status.toUpperCase());
        List<FestivalResponse> festivals = festivalService.getFestivalsByStatus(festivalStatus);
        return ResponseEntity.ok(ApiResponse.success(festivals));
    }
    
    @GetMapping("/years")
    @Operation(summary = "Get distinct years", description = "Get all years that have festivals")
    public ResponseEntity<ApiResponse<List<Integer>>> getDistinctYears() {
        List<Integer> years = festivalService.getDistinctYears();
        return ResponseEntity.ok(ApiResponse.success(years));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create festival", description = "Create a new festival (Admin only)")
    public ResponseEntity<ApiResponse<FestivalResponse>> createFestival(@Valid @RequestBody FestivalRequest request) {
        FestivalResponse festival = festivalService.createFestival(request);
        return ResponseEntity.ok(ApiResponse.success("Festival created successfully", festival));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update festival", description = "Update an existing festival (Admin only)")
    public ResponseEntity<ApiResponse<FestivalResponse>> updateFestival(
            @PathVariable Long id,
            @Valid @RequestBody FestivalRequest request) {
        FestivalResponse festival = festivalService.updateFestival(id, request);
        return ResponseEntity.ok(ApiResponse.success("Festival updated successfully", festival));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete festival", description = "Delete a festival (Super Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteFestival(@PathVariable Long id) {
        festivalService.deleteFestival(id);
        return ResponseEntity.ok(ApiResponse.success("Festival deleted successfully", null));
    }
}


