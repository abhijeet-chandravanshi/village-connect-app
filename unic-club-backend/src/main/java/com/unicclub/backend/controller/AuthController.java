package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.LoginRequest;
import com.unicclub.backend.dto.request.OtpVerifyRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.AuthResponse;
import com.unicclub.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP", description = "Send OTP to the provided phone number")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody LoginRequest request) {
        String message = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
    
    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP", description = "Verify OTP and get JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}


