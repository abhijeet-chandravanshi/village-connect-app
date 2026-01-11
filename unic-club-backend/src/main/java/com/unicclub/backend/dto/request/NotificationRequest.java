package com.unicclub.backend.dto.request;

import com.unicclub.backend.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private Notification.Type type;
    
    private Long targetUserId;  // If null, notification goes to all users
}


