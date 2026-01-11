package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.Festival;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalResponse {
    private Long id;
    private String name;
    private String nameEn;
    private String description;
    private Integer year;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal expectedBudget;
    private BigDecimal totalCollection;
    private BigDecimal totalExpense;
    private String imageUrl;
    private String status;
    private int contributorCount;
    private LocalDateTime createdAt;
    
    public static FestivalResponse fromEntity(Festival festival) {
        return FestivalResponse.builder()
                .id(festival.getId())
                .name(festival.getName())
                .nameEn(festival.getNameEn())
                .description(festival.getDescription())
                .year(festival.getYear())
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .expectedBudget(festival.getExpectedBudget())
                .totalCollection(festival.getTotalCollection())
                .totalExpense(festival.getTotalExpense())
                .imageUrl(festival.getImageUrl())
                .status(festival.getStatus().name())
                .contributorCount(festival.getContributorCount())
                .createdAt(festival.getCreatedAt())
                .build();
    }
}


