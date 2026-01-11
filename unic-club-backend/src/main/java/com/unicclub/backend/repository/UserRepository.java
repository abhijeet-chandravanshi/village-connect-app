package com.unicclub.backend.repository;

import com.unicclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByPhone(String phone);
    
    boolean existsByPhone(String phone);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByWard(String ward);
    
    @Query("SELECT u FROM User u WHERE u.dateOfBirth IS NOT NULL AND " +
           "EXTRACT(MONTH FROM u.dateOfBirth) = :month AND EXTRACT(DAY FROM u.dateOfBirth) = :day")
    List<User> findByBirthdayMonthAndDay(int month, int day);
    
    @Query("SELECT u FROM User u WHERE u.active = true ORDER BY u.name")
    List<User> findAllActiveUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();
    
    List<User> findByNameContainingIgnoreCaseOrPhoneContaining(String name, String phone);
}


