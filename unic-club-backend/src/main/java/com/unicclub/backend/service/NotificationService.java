package com.unicclub.backend.service;

import com.unicclub.backend.dto.response.NotificationResponse;
import com.unicclub.backend.entity.Notification;
import com.unicclub.backend.entity.NotificationRead;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.NotificationReadRepository;
import com.unicclub.backend.repository.NotificationRepository;
import com.unicclub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    private final UserRepository userRepository;
    
    /**
     * Get notifications for a user (both targeted and general)
     */
    public List<NotificationResponse> getNotificationsForUser(User user) {
        List<Notification> notifications = notificationRepository.findNotificationsForUser(user);
        
        // Get set of read notification IDs for this user
        Set<Long> readNotificationIds = notificationReadRepository.findByUser(user).stream()
                .map(nr -> nr.getNotification().getId())
                .collect(Collectors.toSet());
        
        return notifications.stream()
                .map(n -> NotificationResponse.fromEntity(n, readNotificationIds.contains(n.getId())))
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(User user) {
        List<Notification> notifications = notificationRepository.findNotificationsForUser(user);
        Set<Long> readNotificationIds = notificationReadRepository.findByUser(user).stream()
                .map(nr -> nr.getNotification().getId())
                .collect(Collectors.toSet());
        
        return notifications.stream()
                .filter(n -> !readNotificationIds.contains(n.getId()))
                .count();
    }
    
    /**
     * Mark a notification as read for a user
     */
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdWithRelations(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        // Check if already marked as read
        if (!notificationReadRepository.existsByNotificationAndUser(notification, user)) {
            NotificationRead notificationRead = NotificationRead.builder()
                    .notification(notification)
                    .user(user)
                    .build();
            notificationReadRepository.save(notificationRead);
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findNotificationsForUser(user);
        Set<Long> readNotificationIds = notificationReadRepository.findByUser(user).stream()
                .map(nr -> nr.getNotification().getId())
                .collect(Collectors.toSet());
        
        for (Notification notification : notifications) {
            if (!readNotificationIds.contains(notification.getId())) {
                NotificationRead notificationRead = NotificationRead.builder()
                        .notification(notification)
                        .user(user)
                        .build();
                notificationReadRepository.save(notificationRead);
            }
        }
    }
    
    /**
     * Send notification to all users (general notification)
     */
    @Transactional
    public NotificationResponse sendToAll(String title, String message, Notification.Type type, User createdBy) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .targetUser(null)  // null means for all users
                .createdBy(createdBy)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved, false);
    }
    
    /**
     * Send notification to specific users
     */
    @Transactional
    public List<NotificationResponse> sendToUsers(List<Long> userIds, String title, String message, 
                                                   Notification.Type type, User createdBy) {
        return userIds.stream()
                .map(userId -> {
                    User targetUser = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    
                    Notification notification = Notification.builder()
                            .title(title)
                            .message(message)
                            .type(type)
                            .targetUser(targetUser)
                            .createdBy(createdBy)
                            .build();
                    
                    Notification saved = notificationRepository.save(notification);
                    return NotificationResponse.fromEntity(saved, false);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get notification by ID
     */
    public NotificationResponse getNotificationById(Long id, User user) {
        Notification notification = notificationRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        boolean isRead = notificationReadRepository.existsByNotificationAndUser(notification, user);
        return NotificationResponse.fromEntity(notification, isRead);
    }
}
