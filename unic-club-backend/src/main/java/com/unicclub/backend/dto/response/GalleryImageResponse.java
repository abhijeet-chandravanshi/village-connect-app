package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.GalleryImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImageResponse {
    private Long id;
    private Long festivalId;
    private String festivalName;
    private String festivalNameEn;
    private String imageUrl;
    private String caption;
    private Integer year;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
    
    public static GalleryImageResponse fromEntity(GalleryImage galleryImage) {
        return GalleryImageResponse.builder()
                .id(galleryImage.getId())
                .festivalId(galleryImage.getFestival().getId())
                .festivalName(galleryImage.getFestival().getName())
                .festivalNameEn(galleryImage.getFestival().getNameEn())
                .imageUrl(galleryImage.getImageUrl())
                .caption(galleryImage.getCaption())
                .year(galleryImage.getYear())
                .uploadedById(galleryImage.getUploadedBy() != null ? galleryImage.getUploadedBy().getId() : null)
                .uploadedByName(galleryImage.getUploadedBy() != null ? galleryImage.getUploadedBy().getName() : null)
                .createdAt(galleryImage.getCreatedAt())
                .build();
    }
}
