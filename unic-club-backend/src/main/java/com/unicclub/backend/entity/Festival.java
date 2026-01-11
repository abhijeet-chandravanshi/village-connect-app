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
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "festivals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"contributions", "expenses", "galleryImages"})
@EqualsAndHashCode(exclude = {"contributions", "expenses", "galleryImages"})
public class Festival {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "name_en", length = 100)
    private String nameEn;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "festival_year", nullable = false)
    private Integer year;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "expected_budget", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal expectedBudget = BigDecimal.ZERO;
    
    @Column(name = "total_collection", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalCollection = BigDecimal.ZERO;
    
    @Column(name = "total_expense", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalExpense = BigDecimal.ZERO;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.UPCOMING;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "festival", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Contribution> contributions = new HashSet<>();
    
    @OneToMany(mappedBy = "festival", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Expense> expenses = new HashSet<>();
    
    @OneToMany(mappedBy = "festival", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<GalleryImage> galleryImages = new HashSet<>();
    
    public enum Status {
        UPCOMING, ONGOING, COMPLETED
    }
    
    // Helper method to get contributor count
    public int getContributorCount() {
        return (int) contributions.stream()
                .filter(c -> c.getStatus() == Contribution.Status.VERIFIED)
                .map(Contribution::getUser)
                .distinct()
                .count();
    }
}


