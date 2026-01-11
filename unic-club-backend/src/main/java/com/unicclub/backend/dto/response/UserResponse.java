package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String phone;
    private String name;
    private String nameEn;
    private String ward;
    private String wardEn;
    private LocalDate dateOfBirth;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
    
    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .name(user.getName())
                .nameEn(user.getNameEn())
                .ward(user.getWard())
                .wardEn(user.getWardEn())
                .dateOfBirth(user.getDateOfBirth())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}


