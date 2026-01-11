package com.unicclub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserResponse user;
    private boolean isNewUser;
    
    public AuthResponse(String token, UserResponse user, boolean isNewUser) {
        this.token = token;
        this.user = user;
        this.isNewUser = isNewUser;
    }
}


