package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Notification;
import com.unicclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.targetUser IS NULL OR n.targetUser = :user ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(User user);
    
    List<Notification> findByType(Notification.Type type);
    
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllOrderByCreatedAtDesc();
}


