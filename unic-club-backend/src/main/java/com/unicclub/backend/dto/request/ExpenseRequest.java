package com.unicclub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    
    @NotNull(message = "Festival ID is required")
    private Long festivalId;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String category;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private String paidTo;
    
    private LocalDate expenseDate;
    
    private String receiptUrl;
}


