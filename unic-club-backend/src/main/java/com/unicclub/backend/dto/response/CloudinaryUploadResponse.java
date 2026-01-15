package com.unicclub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Cloudinary uploads
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryUploadResponse {
    
    /**
     * Cloudinary public ID (used for transformations and deletion)
     */
    private String publicId;
    
    /**
     * Full secure URL of the uploaded image
     */
    private String url;
    
    /**
     * Thumbnail URL (300x300)
     */
    private String thumbnailUrl;
    
    /**
     * Image format (jpg, png, webp, etc.)
     */
    private String format;
    
    /**
     * Image width in pixels
     */
    private Integer width;
    
    /**
     * Image height in pixels
     */
    private Integer height;
    
    /**
     * File size in bytes
     */
    private Long bytes;
}
