package com.unicclub.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.Basic;
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
import java.time.LocalDateTime;

@Entity
@Table(name = "contributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "festival", "verifiedBy"})
@EqualsAndHashCode(exclude = {"user", "festival", "verifiedBy"})
public class Contribution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_id", nullable = false)
    private Festival festival;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.UPI;
    
    @Column(name = "transaction_id", length = 100)
    private String transactionId;
    
    @Column(name = "proof_image_url")
    private String proofImageUrl;
    
    // Secure byte array storage for payment proof images
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "proof_image_data", columnDefinition = "BYTEA")
    private byte[] proofImageData;
    
    @Column(name = "proof_image_type", length = 50)
    private String proofImageType;  // e.g., "image/jpeg", "image/png"
    
    @Column(name = "proof_image_name", length = 255)
    private String proofImageName;  // Original filename
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PaymentMethod {
        UPI, CASH, BANK_TRANSFER
    }
    
    public enum Status {
        PENDING, VERIFIED, REJECTED
    }
}


