package com.unicclub.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary Configuration
 * 
 * Configures Cloudinary SDK with credentials from environment variables.
 * Used for storing public images (festival banners, gallery photos).
 * 
 * To get credentials:
 * 1. Go to https://cloudinary.com and sign up (free tier available)
 * 2. Dashboard shows: Cloud Name, API Key, API Secret
 * 3. Add to .env file or environment variables
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // Check if Cloudinary is configured
        if (cloudName.isEmpty() || apiKey.isEmpty() || apiSecret.isEmpty()) {
            System.out.println("WARNING: Cloudinary not configured. Image uploads will fail.");
            System.out.println("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
            // Return a non-functional Cloudinary instance
            return new Cloudinary();
        }
        
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true  // Use HTTPS
        ));
    }
}
