package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Notification;
import com.unicclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Eagerly fetch targetUser and createdBy to avoid LazyInitializationException
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.targetUser LEFT JOIN FETCH n.createdBy WHERE n.targetUser IS NULL OR n.targetUser = :user ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("user") User user);
    
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.targetUser LEFT JOIN FETCH n.createdBy WHERE n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByType(@Param("type") Notification.Type type);
    
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.targetUser LEFT JOIN FETCH n.createdBy ORDER BY n.createdAt DESC")
    List<Notification> findAllOrderByCreatedAtDesc();
    
    // Find by ID with eager fetch
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.targetUser LEFT JOIN FETCH n.createdBy WHERE n.id = :id")
    Optional<Notification> findByIdWithRelations(@Param("id") Long id);
}


