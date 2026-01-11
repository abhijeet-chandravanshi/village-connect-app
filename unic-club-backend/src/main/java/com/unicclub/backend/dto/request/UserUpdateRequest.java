package com.unicclub.backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserUpdateRequest {
    private String name;
    private String nameEn;
    private String ward;
    private String wardEn;
    private LocalDate dateOfBirth;
    private String avatarUrl;
}


