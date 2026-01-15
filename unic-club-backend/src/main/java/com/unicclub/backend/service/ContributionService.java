package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.ContributionRequest;
import com.unicclub.backend.dto.response.ContributionResponse;
import com.unicclub.backend.entity.Contribution;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.ContributionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContributionService {
    
    private static final Logger log = LoggerFactory.getLogger(ContributionService.class);
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    
    private final ContributionRepository contributionRepository;
    private final FestivalService festivalService;
    private final UserService userService;
    
    public Contribution findById(Long id) {
        return contributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution not found with id: " + id));
    }
    
    @Transactional
    public ContributionResponse createContribution(Long userId, ContributionRequest request) {
        User user = userService.findById(userId);
        Festival festival = festivalService.findById(request.getFestivalId());
        
        Contribution contribution = Contribution.builder()
                .user(user)
                .festival(festival)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : Contribution.PaymentMethod.UPI)
                .transactionId(request.getTransactionId())
                .proofImageUrl(request.getProofImageUrl())
                .status(Contribution.Status.PENDING)
                .build();
        
        return ContributionResponse.fromEntity(contributionRepository.save(contribution));
    }
    
    @Transactional(readOnly = true)
    public List<ContributionResponse> getUserContributions(Long userId) {
        User user = userService.findById(userId);
        return contributionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ContributionResponse> getFestivalContributions(Long festivalId) {
        Festival festival = festivalService.findById(festivalId);
        return contributionRepository.findByFestival(festival).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ContributionResponse> getFestivalVerifiedContributions(Long festivalId) {
        Festival festival = festivalService.findById(festivalId);
        return contributionRepository.findByFestivalAndStatus(festival, Contribution.Status.VERIFIED).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ContributionResponse> getPendingContributions() {
        return contributionRepository.findPendingContributions().stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ContributionResponse> getRecentContributions() {
        return contributionRepository.findRecentContributions().stream()
                .limit(10)
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ContributionResponse verifyContribution(Long id, Long verifiedByUserId) {
        Contribution contribution = findById(id);
        User verifiedBy = userService.findById(verifiedByUserId);
        
        contribution.setStatus(Contribution.Status.VERIFIED);
        contribution.setVerifiedBy(verifiedBy);
        contribution.setVerifiedAt(LocalDateTime.now());
        
        Contribution saved = contributionRepository.save(contribution);
        
        // Update festival totals
        festivalService.updateFestivalTotals(contribution.getFestival().getId());
        
        return ContributionResponse.fromEntity(saved);
    }
    
    @Transactional
    public ContributionResponse rejectContribution(Long id, Long verifiedByUserId, String reason) {
        Contribution contribution = findById(id);
        User verifiedBy = userService.findById(verifiedByUserId);
        
        contribution.setStatus(Contribution.Status.REJECTED);
        contribution.setVerifiedBy(verifiedBy);
        contribution.setVerifiedAt(LocalDateTime.now());
        contribution.setRejectionReason(reason);
        
        return ContributionResponse.fromEntity(contributionRepository.save(contribution));
    }
    
    public long countPendingContributions() {
        return contributionRepository.findByStatus(Contribution.Status.PENDING).size();
    }
    
    // ========== Payment Proof Image Methods (Secure Byte Array Storage) ==========
    
    /**
     * Upload payment proof image for a contribution
     * Stores image securely as byte array in database
     */
    @Transactional
    public void uploadProofImage(Long contributionId, Long userId, MultipartFile file) throws IOException {
        Contribution contribution = findById(contributionId);
        
        // Verify the user owns this contribution or is admin
        if (!contribution.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only upload proof for your own contributions");
        }
        
        // Validate file
        validateImageFile(file);
        
        // Store image data
        contribution.setProofImageData(file.getBytes());
        contribution.setProofImageType(file.getContentType());
        contribution.setProofImageName(file.getOriginalFilename());
        
        contributionRepository.save(contribution);
        log.info("Payment proof uploaded for contribution {} by user {}", contributionId, userId);
    }
    
    /**
     * Upload payment proof image by admin for any contribution
     */
    @Transactional
    public void uploadProofImageByAdmin(Long contributionId, MultipartFile file) throws IOException {
        Contribution contribution = findById(contributionId);
        
        // Validate file
        validateImageFile(file);
        
        // Store image data
        contribution.setProofImageData(file.getBytes());
        contribution.setProofImageType(file.getContentType());
        contribution.setProofImageName(file.getOriginalFilename());
        
        contributionRepository.save(contribution);
        log.info("Payment proof uploaded by admin for contribution {}", contributionId);
    }
    
    /**
     * Get payment proof image data
     * Only accessible by admins or the contribution owner
     */
    public byte[] getProofImageData(Long contributionId) {
        Contribution contribution = findById(contributionId);
        if (contribution.getProofImageData() == null) {
            throw new ResourceNotFoundException("No proof image found for contribution: " + contributionId);
        }
        return contribution.getProofImageData();
    }
    
    /**
     * Get payment proof image content type
     */
    public String getProofImageType(Long contributionId) {
        Contribution contribution = findById(contributionId);
        return contribution.getProofImageType();
    }
    
    /**
     * Get payment proof image filename
     */
    public String getProofImageName(Long contributionId) {
        Contribution contribution = findById(contributionId);
        return contribution.getProofImageName();
    }
    
    /**
     * Check if contribution has proof image
     */
    public boolean hasProofImage(Long contributionId) {
        Contribution contribution = findById(contributionId);
        return contribution.getProofImageData() != null && contribution.getProofImageData().length > 0;
    }
    
    /**
     * Delete payment proof image
     */
    @Transactional
    public void deleteProofImage(Long contributionId) {
        Contribution contribution = findById(contributionId);
        contribution.setProofImageData(null);
        contribution.setProofImageType(null);
        contribution.setProofImageName(null);
        contributionRepository.save(contribution);
        log.info("Payment proof deleted for contribution {}", contributionId);
    }
    
    /**
     * Validate image file (size, type)
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or not provided");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 2MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: JPEG, PNG, WebP");
        }
    }
    
    /**
     * Check if user owns the contribution
     */
    public boolean isOwner(Long contributionId, Long userId) {
        Contribution contribution = findById(contributionId);
        return contribution.getUser().getId().equals(userId);
    }
}


