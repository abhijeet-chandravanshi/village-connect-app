package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.GalleryImageRequest;
import com.unicclub.backend.dto.response.GalleryImageResponse;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.GalleryImage;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.FestivalRepository;
import com.unicclub.backend.repository.GalleryImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryService {
    
    private final GalleryImageRepository galleryImageRepository;
    private final FestivalRepository festivalRepository;
    
    /**
     * Get all gallery images ordered by year desc
     */
    public List<GalleryImageResponse> getAllImages() {
        return galleryImageRepository.findAllOrderByYearDesc().stream()
                .map(GalleryImageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get gallery images by year
     */
    public List<GalleryImageResponse> getImagesByYear(Integer year) {
        return galleryImageRepository.findByYear(year).stream()
                .map(GalleryImageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get gallery images by festival
     */
    public List<GalleryImageResponse> getImagesByFestival(Long festivalId) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        return galleryImageRepository.findByFestival(festival).stream()
                .map(GalleryImageResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get distinct years with gallery images
     */
    public List<Integer> getDistinctYears() {
        return galleryImageRepository.findDistinctYears();
    }
    
    /**
     * Create a new gallery image record
     */
    @Transactional
    public GalleryImageResponse createImage(GalleryImageRequest request, User uploadedBy) {
        Festival festival = festivalRepository.findById(request.getFestivalId())
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        GalleryImage galleryImage = GalleryImage.builder()
                .festival(festival)
                .imageUrl(request.getImageUrl())
                .caption(request.getCaption())
                .year(request.getYear())
                .uploadedBy(uploadedBy)
                .build();
        
        GalleryImage saved = galleryImageRepository.save(galleryImage);
        return GalleryImageResponse.fromEntity(saved);
    }
    
    /**
     * Create gallery image directly with URL (for Cloudinary upload integration)
     */
    @Transactional
    public GalleryImageResponse createImageWithUrl(Long festivalId, String imageUrl, String caption, Integer year, User uploadedBy) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        GalleryImage galleryImage = GalleryImage.builder()
                .festival(festival)
                .imageUrl(imageUrl)
                .caption(caption)
                .year(year)
                .uploadedBy(uploadedBy)
                .build();
        
        GalleryImage saved = galleryImageRepository.save(galleryImage);
        return GalleryImageResponse.fromEntity(saved);
    }
    
    /**
     * Delete gallery image
     */
    @Transactional
    public void deleteImage(Long id) {
        if (!galleryImageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gallery image not found");
        }
        galleryImageRepository.deleteById(id);
    }
    
    /**
     * Get gallery image by ID
     */
    public GalleryImageResponse getImageById(Long id) {
        GalleryImage image = galleryImageRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery image not found"));
        return GalleryImageResponse.fromEntity(image);
    }
}
