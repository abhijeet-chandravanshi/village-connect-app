package com.unicclub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImageRequest {
    
    @NotNull(message = "Festival ID is required")
    private Long festivalId;
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String caption;
    
    @NotNull(message = "Year is required")
    private Integer year;
}
