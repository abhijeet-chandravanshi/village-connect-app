package com.unicclub.backend.dto.response;

import com.unicclub.backend.entity.Expense;
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
public class ExpenseResponse {
    private Long id;
    private Long festivalId;
    private String festivalName;
    private String festivalNameEn;
    private String description;
    private String category;
    private BigDecimal amount;
    private String paidTo;
    private LocalDate expenseDate;
    private String receiptUrl;
    private Long addedById;
    private String addedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ExpenseResponse fromEntity(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .festivalId(expense.getFestival().getId())
                .festivalName(expense.getFestival().getName())
                .festivalNameEn(expense.getFestival().getNameEn())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .paidTo(expense.getPaidTo())
                .expenseDate(expense.getExpenseDate())
                .receiptUrl(expense.getReceiptUrl())
                .addedById(expense.getAddedBy().getId())
                .addedByName(expense.getAddedBy().getName())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
