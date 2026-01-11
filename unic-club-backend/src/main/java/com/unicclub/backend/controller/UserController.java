package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.UserUpdateRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.UserResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }
    
    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
    
    @GetMapping
    @Operation(summary = "Get all users", description = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get a specific user by their ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by name or phone")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam String query) {
        List<UserResponse> users = userService.searchUsers(query);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}


