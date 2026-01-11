package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.LoginRequest;
import com.unicclub.backend.dto.request.OtpVerifyRequest;
import com.unicclub.backend.dto.response.AuthResponse;
import com.unicclub.backend.dto.response.UserResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    
    // In-memory OTP storage (for demo purposes - use Redis in production)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    
    // Demo OTP for testing
    private static final String DEMO_OTP = "123456";
    
    public String sendOtp(LoginRequest request) {
        String phone = request.getPhone();
        
        // Generate OTP (in production, use SMS service)
        String otp = generateOtp();
        
        // Store OTP
        otpStorage.put(phone, otp);
        
        log.info("OTP sent to phone {}: {}", phone, otp);
        
        // In production, send OTP via SMS service here
        // smsService.sendOtp(phone, otp);
        
        return "OTP sent successfully";
    }
    
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String phone = request.getPhone();
        String otp = request.getOtp();
        
        // Verify OTP
        String storedOtp = otpStorage.get(phone);
        
        // Allow demo OTP for testing
        if (!DEMO_OTP.equals(otp) && (storedOtp == null || !storedOtp.equals(otp))) {
            throw new RuntimeException("Invalid OTP");
        }
        
        // Remove used OTP
        otpStorage.remove(phone);
        
        // Find or create user
        User user = userService.findOrCreateByPhone(phone);
        boolean isNewUser = userService.isNewUser(phone);
        
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user);
        
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(UserResponse.fromEntity(user))
                .isNewUser(isNewUser)
                .build();
    }
    
    private String generateOtp() {
        // Generate 6-digit OTP
        int otp = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(otp);
    }
}


