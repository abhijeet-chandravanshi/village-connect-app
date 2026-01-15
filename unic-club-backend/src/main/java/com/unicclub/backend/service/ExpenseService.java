package com.unicclub.backend.service;

import com.unicclub.backend.dto.request.ExpenseRequest;
import com.unicclub.backend.dto.response.ExpenseResponse;
import com.unicclub.backend.entity.Expense;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.exception.ResourceNotFoundException;
import com.unicclub.backend.repository.ExpenseRepository;
import com.unicclub.backend.repository.FestivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final FestivalRepository festivalRepository;
    
    /**
     * Get all expenses
     */
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAllWithRelations().stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get expenses by festival
     */
    public List<ExpenseResponse> getExpensesByFestival(Long festivalId) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        return expenseRepository.findByFestivalOrderByExpenseDateDesc(festival).stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get expenses by category
     */
    public List<ExpenseResponse> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category).stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get distinct expense categories
     */
    public List<String> getDistinctCategories() {
        return expenseRepository.findDistinctCategories();
    }
    
    /**
     * Get total expense amount for a festival
     */
    public BigDecimal getTotalExpenseByFestival(Long festivalId) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        BigDecimal total = expenseRepository.sumAmountByFestival(festival);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Get expense breakdown by category for a festival
     */
    public Map<String, BigDecimal> getExpenseBreakdownByFestival(Long festivalId) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        List<Object[]> results = expenseRepository.sumAmountByFestivalGroupByCategory(festival);
        
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (BigDecimal) row[1]
                ));
    }
    
    /**
     * Create expense
     */
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request, User addedBy) {
        Festival festival = festivalRepository.findById(request.getFestivalId())
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        Expense expense = Expense.builder()
                .festival(festival)
                .description(request.getDescription())
                .category(request.getCategory())
                .amount(request.getAmount())
                .paidTo(request.getPaidTo())
                .expenseDate(request.getExpenseDate())
                .receiptUrl(request.getReceiptUrl())
                .addedBy(addedBy)
                .build();
        
        Expense saved = expenseRepository.save(expense);
        
        // Update festival's total expense
        updateFestivalTotalExpense(festival);
        
        return ExpenseResponse.fromEntity(saved);
    }
    
    /**
     * Update expense
     */
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        Festival festival = festivalRepository.findById(request.getFestivalId())
                .orElseThrow(() -> new ResourceNotFoundException("Festival not found"));
        
        expense.setFestival(festival);
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setPaidTo(request.getPaidTo());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setReceiptUrl(request.getReceiptUrl());
        
        Expense saved = expenseRepository.save(expense);
        
        // Update festival's total expense
        updateFestivalTotalExpense(festival);
        
        return ExpenseResponse.fromEntity(saved);
    }
    
    /**
     * Delete expense
     */
    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        Festival festival = expense.getFestival();
        expenseRepository.delete(expense);
        
        // Update festival's total expense
        updateFestivalTotalExpense(festival);
    }
    
    /**
     * Get expense by ID
     */
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return ExpenseResponse.fromEntity(expense);
    }
    
    /**
     * Update festival's total expense amount
     */
    private void updateFestivalTotalExpense(Festival festival) {
        BigDecimal total = expenseRepository.sumAmountByFestival(festival);
        festival.setTotalExpense(total != null ? total : BigDecimal.ZERO);
        festivalRepository.save(festival);
    }
}
