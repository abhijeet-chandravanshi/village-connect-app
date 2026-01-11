package com.unicclub.backend.dto.request;

import com.unicclub.backend.entity.Contribution;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ContributionRequest {
    
    @NotNull(message = "Festival ID is required")
    private Long festivalId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private Contribution.PaymentMethod paymentMethod;
    
    private String transactionId;
    
    private String proofImageUrl;
}


