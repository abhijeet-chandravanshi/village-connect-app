package com.unicclub.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.unicclub.backend.dto.response.CloudinaryUploadResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Service for handling Cloudinary image uploads
 * 
 * Features:
 * - Upload images to specific folders
 * - Auto-optimization (WebP, quality)
 * - Generate thumbnails
 * - Delete images
 * - Get optimized URLs
 */
@Service
@RequiredArgsConstructor
public class CloudinaryService {
    
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for public images
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    
    private final Cloudinary cloudinary;
    
    /**
     * Upload image to Cloudinary
     * 
     * @param file The image file to upload
     * @param folder The folder path (e.g., "festivals/2026", "gallery/events")
     * @return CloudinaryUploadResponse with URLs and metadata
     */
    public CloudinaryUploadResponse uploadImage(MultipartFile file, String folder) throws IOException {
        validateImageFile(file);
        
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "unic-club/" + folder,
                "resource_type", "image",
                "quality", "auto:good",      // Auto quality optimization
                "fetch_format", "auto"       // Auto format (WebP if supported)
        );
        
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        
        String publicId = (String) uploadResult.get("public_id");
        String secureUrl = (String) uploadResult.get("secure_url");
        String format = (String) uploadResult.get("format");
        Integer width = (Integer) uploadResult.get("width");
        Integer height = (Integer) uploadResult.get("height");
        Long bytes = uploadResult.get("bytes") != null ? ((Number) uploadResult.get("bytes")).longValue() : 0L;
        
        // Generate thumbnail URL
        String thumbnailUrl = generateThumbnailUrl(publicId, 300, 300);
        
        log.info("Image uploaded to Cloudinary: {} ({}x{}, {} bytes)", publicId, width, height, bytes);
        
        return CloudinaryUploadResponse.builder()
                .publicId(publicId)
                .url(secureUrl)
                .thumbnailUrl(thumbnailUrl)
                .format(format)
                .width(width)
                .height(height)
                .bytes(bytes)
                .build();
    }
    
    /**
     * Upload festival image
     */
    public CloudinaryUploadResponse uploadFestivalImage(MultipartFile file, Long festivalId, Integer year) throws IOException {
        String folder = String.format("festivals/%d/%d", year, festivalId);
        return uploadImage(file, folder);
    }
    
    /**
     * Upload gallery image
     */
    public CloudinaryUploadResponse uploadGalleryImage(MultipartFile file, Integer year, String eventName) throws IOException {
        String folder = String.format("gallery/%d/%s", year, sanitizeFolderName(eventName));
        return uploadImage(file, folder);
    }
    
    /**
     * Upload user avatar
     */
    public CloudinaryUploadResponse uploadAvatar(MultipartFile file, Long userId) throws IOException {
        String folder = "avatars";
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "unic-club/" + folder,
                "resource_type", "image",
                "public_id", "user_" + userId,  // Fixed public_id for avatar
                "overwrite", true,               // Replace existing avatar
                "quality", "auto:good",
                "transformation", ObjectUtils.asMap(
                        "width", 200,
                        "height", 200,
                        "crop", "fill",
                        "gravity", "face"        // Focus on face
                )
        );
        
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        
        String publicId = (String) uploadResult.get("public_id");
        String secureUrl = (String) uploadResult.get("secure_url");
        
        log.info("Avatar uploaded for user {}: {}", userId, publicId);
        
        return CloudinaryUploadResponse.builder()
                .publicId(publicId)
                .url(secureUrl)
                .thumbnailUrl(secureUrl) // Avatar is already thumbnail size
                .build();
    }
    
    /**
     * Delete image from Cloudinary
     */
    public boolean deleteImage(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String status = (String) result.get("result");
            boolean success = "ok".equals(status);
            
            if (success) {
                log.info("Image deleted from Cloudinary: {}", publicId);
            } else {
                log.warn("Failed to delete image from Cloudinary: {} - {}", publicId, status);
            }
            
            return success;
        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary: {}", publicId, e);
            return false;
        }
    }
    
    /**
     * Generate optimized URL with transformations
     */
    public String generateOptimizedUrl(String publicId, int width, int height) {
        return cloudinary.url()
                .transformation(new com.cloudinary.Transformation()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto")
                        .fetchFormat("auto"))
                .secure(true)
                .generate(publicId);
    }
    
    /**
     * Generate thumbnail URL
     */
    public String generateThumbnailUrl(String publicId, int width, int height) {
        return cloudinary.url()
                .transformation(new com.cloudinary.Transformation()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto:low")
                        .fetchFormat("auto"))
                .secure(true)
                .generate(publicId);
    }
    
    /**
     * Generate blurred placeholder URL (for lazy loading)
     */
    public String generatePlaceholderUrl(String publicId) {
        return cloudinary.url()
                .transformation(new com.cloudinary.Transformation()
                        .width(50)
                        .effect("blur:1000")
                        .quality(30)
                        .fetchFormat("auto"))
                .secure(true)
                .generate(publicId);
    }
    
    /**
     * Validate image file
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or not provided");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }
    }
    
    /**
     * Sanitize folder name (remove special characters)
     */
    private String sanitizeFolderName(String name) {
        if (name == null) return "default";
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\-_]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
    
    /**
     * Check if Cloudinary is configured
     */
    public boolean isConfigured() {
        try {
            // Try to ping Cloudinary
            cloudinary.api().ping(ObjectUtils.emptyMap());
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
