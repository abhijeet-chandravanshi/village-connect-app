package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.Contribution;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userNameEn;
    private String userPhone;
    private Long festivalId;
    private String festivalName;
    private String festivalNameEn;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionId;
    private String proofImageUrl;
    private String status;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    
    public static ContributionResponse fromEntity(Contribution contribution) {
        return ContributionResponse.builder()
                .id(contribution.getId())
                .userId(contribution.getUser().getId())
                .userName(contribution.getUser().getName())
                .userNameEn(contribution.getUser().getNameEn())
                .userPhone(contribution.getUser().getPhone())
                .festivalId(contribution.getFestival().getId())
                .festivalName(contribution.getFestival().getName())
                .festivalNameEn(contribution.getFestival().getNameEn())
                .amount(contribution.getAmount())
                .paymentMethod(contribution.getPaymentMethod().name())
                .transactionId(contribution.getTransactionId())
                .proofImageUrl(contribution.getProofImageUrl())
                .status(contribution.getStatus().name())
                .verifiedByName(contribution.getVerifiedBy() != null ? contribution.getVerifiedBy().getName() : null)
                .verifiedAt(contribution.getVerifiedAt())
                .rejectionReason(contribution.getRejectionReason())
                .createdAt(contribution.getCreatedAt())
                .build();
    }
}


