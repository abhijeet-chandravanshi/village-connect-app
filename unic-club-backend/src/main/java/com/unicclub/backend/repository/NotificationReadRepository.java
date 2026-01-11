package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Notification;
import com.unicclub.backend.entity.NotificationRead;
import com.unicclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {
    
    Optional<NotificationRead> findByNotificationAndUser(Notification notification, User user);
    
    boolean existsByNotificationAndUser(Notification notification, User user);
    
    List<NotificationRead> findByUser(User user);
    
    void deleteByUser(User user);
}


