package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.UserUpdateRequest;
import com.unicclub.backend.dto.response.UserResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    public User findByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with phone: " + phone));
    }
    
    public User findOrCreateByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .phone(phone)
                            .role(User.Role.USER)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }
    
    public boolean isNewUser(String phone) {
        return userRepository.findByPhone(phone)
                .map(user -> user.getName() == null || user.getName().isEmpty())
                .orElse(true);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = findById(id);
        
        if (request.getName() != null) user.setName(request.getName());
        if (request.getNameEn() != null) user.setNameEn(request.getNameEn());
        if (request.getWard() != null) user.setWard(request.getWard());
        if (request.getWardEn() != null) user.setWardEn(request.getWardEn());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        
        return UserResponse.fromEntity(userRepository.save(user));
    }
    
    @Transactional
    public UserResponse updateRole(Long id, User.Role role) {
        User user = findById(id);
        user.setRole(role);
        return UserResponse.fromEntity(userRepository.save(user));
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllActiveUsers().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrPhoneContaining(query, query).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public long countActiveUsers() {
        return userRepository.countActiveUsers();
    }
    
    public List<User> findUsersWithBirthdayToday(int month, int day) {
        return userRepository.findByBirthdayMonthAndDay(month, day);
    }
}


