package com.unicclub.backend.dto.request;

import com.unicclub.backend.entity.Festival;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FestivalRequest {
    
    @NotBlank(message = "Festival name is required")
    private String name;
    
    private String nameEn;
    
    private String description;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private BigDecimal expectedBudget;
    
    private String imageUrl;
    
    private Festival.Status status;
}


