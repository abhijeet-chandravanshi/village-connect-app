package com.unicclub.backend.controller;

import com.unicclub.backend.dto.request.ExpenseRequest;
import com.unicclub.backend.dto.response.ApiResponse;
import com.unicclub.backend.dto.response.ExpenseResponse;
import com.unicclub.backend.entity.User;
import com.unicclub.backend.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Expense management APIs")
public class ExpenseController {
    
    private final ExpenseService expenseService;
    
    @GetMapping
    @Operation(summary = "Get all expenses", description = "Get all expenses")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses() {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/festival/{festivalId}")
    @Operation(summary = "Get expenses by festival", description = "Get all expenses for a specific festival")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByFestival(@PathVariable Long festivalId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/festival/{festivalId}/total")
    @Operation(summary = "Get total expense", description = "Get total expense amount for a festival")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getTotalExpense(@PathVariable Long festivalId) {
        BigDecimal total = expenseService.getTotalExpenseByFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("totalExpense", total)));
    }
    
    @GetMapping("/festival/{festivalId}/breakdown")
    @Operation(summary = "Get expense breakdown", description = "Get expense breakdown by category for a festival")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getExpenseBreakdown(@PathVariable Long festivalId) {
        Map<String, BigDecimal> breakdown = expenseService.getExpenseBreakdownByFestival(festivalId);
        return ResponseEntity.ok(ApiResponse.success(breakdown));
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get expenses by category", description = "Get all expenses in a specific category")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByCategory(@PathVariable String category) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/categories")
    @Operation(summary = "Get distinct categories", description = "Get all distinct expense categories")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctCategories() {
        List<String> categories = expenseService.getDistinctCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID", description = "Get a specific expense by ID")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(@PathVariable Long id) {
        ExpenseResponse expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create expense", description = "Create a new expense (Admin only)")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.createExpense(request, admin);
        return ResponseEntity.ok(ApiResponse.success("Expense created successfully", expense));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update expense", description = "Update an existing expense (Admin only)")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expense));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete expense", description = "Delete an expense (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}
