package com.unicclub.backend.controller;

import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.NotificationResponse;
import com.unicclub.backend.entity.Notification;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/my")
    @Operation(summary = "Get my notifications", description = "Get all notifications for the current user")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal User user) {
        List<NotificationResponse> notifications = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
    
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID", description = "Get a specific notification by ID")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        NotificationResponse notification = notificationService.getNotificationById(id, user);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
    
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
    
    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
    
    @PostMapping("/send-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Send to all users", description = "Send notification to all users (Admin only)")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendToAll(
            @AuthenticationPrincipal User admin,
            @RequestBody SendNotificationRequest request) {
        Notification.Type type = Notification.Type.valueOf(request.getType().toUpperCase());
        NotificationResponse notification = notificationService.sendToAll(
                request.getTitle(), 
                request.getMessage(), 
                type, 
                admin
        );
        return ResponseEntity.ok(ApiResponse.success("Notification sent to all users", notification));
    }
    
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Send to specific users", description = "Send notification to specific users (Admin only)")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> sendToUsers(
            @AuthenticationPrincipal User admin,
            @RequestBody SendToUsersRequest request) {
        Notification.Type type = Notification.Type.valueOf(request.getType().toUpperCase());
        List<NotificationResponse> notifications = notificationService.sendToUsers(
                request.getUserIds(),
                request.getTitle(),
                request.getMessage(),
                type,
                admin
        );
        return ResponseEntity.ok(ApiResponse.success("Notifications sent", notifications));
    }
    
    // Inner classes for request bodies
    @lombok.Data
    public static class SendNotificationRequest {
        private String title;
        private String message;
        private String type;
    }
    
    @lombok.Data
    public static class SendToUsersRequest {
        private List<Long> userIds;
        private String title;
        private String message;
        private String type;
    }
}
