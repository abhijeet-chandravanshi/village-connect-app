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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContributionService {
    
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
    
    public List<ContributionResponse> getUserContributions(Long userId) {
        User user = userService.findById(userId);
        return contributionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ContributionResponse> getFestivalContributions(Long festivalId) {
        Festival festival = festivalService.findById(festivalId);
        return contributionRepository.findByFestival(festival).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ContributionResponse> getFestivalVerifiedContributions(Long festivalId) {
        Festival festival = festivalService.findById(festivalId);
        return contributionRepository.findByFestivalAndStatus(festival, Contribution.Status.VERIFIED).stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ContributionResponse> getPendingContributions() {
        return contributionRepository.findPendingContributions().stream()
                .map(ContributionResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
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
}


