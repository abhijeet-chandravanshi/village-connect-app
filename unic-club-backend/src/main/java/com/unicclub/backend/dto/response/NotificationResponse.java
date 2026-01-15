package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long targetUserId;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private boolean isRead;
    
    public static NotificationResponse fromEntity(Notification notification, boolean isRead) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .targetUserId(notification.getTargetUser() != null ? notification.getTargetUser().getId() : null)
                .createdById(notification.getCreatedBy() != null ? notification.getCreatedBy().getId() : null)
                .createdByName(notification.getCreatedBy() != null ? notification.getCreatedBy().getName() : null)
                .createdAt(notification.getCreatedAt())
                .isRead(isRead)
                .build();
    }
}
