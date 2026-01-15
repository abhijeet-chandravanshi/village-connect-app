package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.FestivalRequest;
import com.unicclub.backend.dto.response.FestivalResponse;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.ContributionRepository;
import com.unicclub.backend.repository.ExpenseRepository;
import com.unicclub.backend.repository.FestivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FestivalService {
    
    private final FestivalRepository festivalRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;
    
    public Festival findById(Long id) {
        return festivalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found with id: " + id));
    }
    
    public List<FestivalResponse> getAllFestivals() {
        return festivalRepository.findAllOrderByYearDesc().stream()
                .map(this::toResponseWithUpdatedTotals)
                .collect(Collectors.toList());
    }
    
    public List<FestivalResponse> getActiveFestivals() {
        return festivalRepository.findActiveFestivals().stream()
                .map(this::toResponseWithUpdatedTotals)
                .collect(Collectors.toList());
    }
    
    public List<FestivalResponse> getFestivalsByYear(Integer year) {
        return festivalRepository.findByYearOrderByStartDateAsc(year).stream()
                .map(this::toResponseWithUpdatedTotals)
                .collect(Collectors.toList());
    }
    
    public List<FestivalResponse> getFestivalsByStatus(Festival.Status status) {
        return festivalRepository.findByStatus(status).stream()
                .map(this::toResponseWithUpdatedTotals)
                .collect(Collectors.toList());
    }
    
    public FestivalResponse getFestivalById(Long id) {
        Festival festival = findById(id);
        return toResponseWithUpdatedTotals(festival);
    }
    
    @Transactional
    public FestivalResponse createFestival(FestivalRequest request) {
        Festival festival = Festival.builder()
                .name(request.getName())
                .nameEn(request.getNameEn())
                .description(request.getDescription())
                .year(request.getYear())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .expectedBudget(request.getExpectedBudget() != null ? request.getExpectedBudget() : BigDecimal.ZERO)
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : Festival.Status.UPCOMING)
                .build();
        
        return FestivalResponse.fromEntity(festivalRepository.save(festival));
    }
    
    @Transactional
    public FestivalResponse updateFestival(Long id, FestivalRequest request) {
        Festival festival = findById(id);
        
        if (request.getName() != null) festival.setName(request.getName());
        if (request.getNameEn() != null) festival.setNameEn(request.getNameEn());
        if (request.getDescription() != null) festival.setDescription(request.getDescription());
        if (request.getYear() != null) festival.setYear(request.getYear());
        if (request.getStartDate() != null) festival.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) festival.setEndDate(request.getEndDate());
        if (request.getExpectedBudget() != null) festival.setExpectedBudget(request.getExpectedBudget());
        if (request.getImageUrl() != null) festival.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) festival.setStatus(request.getStatus());
        
        return toResponseWithUpdatedTotals(festivalRepository.save(festival));
    }
    
    @Transactional
    public void deleteFestival(Long id) {
        Festival festival = findById(id);
        festivalRepository.delete(festival);
    }
    
    public List<Integer> getDistinctYears() {
        return festivalRepository.findDistinctYears();
    }
    
    /**
     * Get total verified collection across all festivals
     */
    public BigDecimal getTotalVerifiedCollection() {
        return festivalRepository.findAll().stream()
                .map(festival -> {
                    BigDecimal collection = contributionRepository.sumVerifiedAmountByFestival(festival);
                    return collection != null ? collection : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @Transactional
    public void updateFestivalTotals(Long festivalId) {
        Festival festival = findById(festivalId);
        
        BigDecimal totalCollection = contributionRepository.sumVerifiedAmountByFestival(festival);
        BigDecimal totalExpense = expenseRepository.sumAmountByFestival(festival);
        
        festival.setTotalCollection(totalCollection != null ? totalCollection : BigDecimal.ZERO);
        festival.setTotalExpense(totalExpense != null ? totalExpense : BigDecimal.ZERO);
        
        festivalRepository.save(festival);
    }
    
    private FestivalResponse toResponseWithUpdatedTotals(Festival festival) {
        BigDecimal totalCollection = contributionRepository.sumVerifiedAmountByFestival(festival);
        BigDecimal totalExpense = expenseRepository.sumAmountByFestival(festival);
        long contributorCount = contributionRepository.countDistinctContributorsByFestival(festival);
        
        return FestivalResponse.builder()
                .id(festival.getId())
                .name(festival.getName())
                .nameEn(festival.getNameEn())
                .description(festival.getDescription())
                .year(festival.getYear())
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .expectedBudget(festival.getExpectedBudget())
                .totalCollection(totalCollection != null ? totalCollection : BigDecimal.ZERO)
                .totalExpense(totalExpense != null ? totalExpense : BigDecimal.ZERO)
                .imageUrl(festival.getImageUrl())
                .status(festival.getStatus().name())
                .contributorCount((int) contributorCount)
                .createdAt(festival.getCreatedAt())
                .build();
    }
}


