package com.unicclub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"festival", "addedBy"})
@EqualsAndHashCode(exclude = {"festival", "addedBy"})
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_id", nullable = false)
    private Festival festival;
    
    @Column(nullable = false)
    private String description;
    
    @Column(length = 50)
    private String category;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "paid_to", length = 100)
    private String paidTo;
    
    @Column(name = "expense_date")
    private LocalDate expenseDate;
    
    @Column(name = "receipt_url")
    private String receiptUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", nullable = false)
    private User addedBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


