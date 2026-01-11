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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"contributions"})
@EqualsAndHashCode(exclude = {"contributions"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 10)
    private String phone;
    
    @Column(length = 100)
    private String name;
    
    @Column(name = "name_en", length = 100)
    private String nameEn;
    
    @Column(length = 50)
    private String ward;
    
    @Column(name = "ward_en", length = 50)
    private String wardEn;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Contribution> contributions = new HashSet<>();
    
    public enum Role {
        USER, ADMIN, SUPER_ADMIN
    }
}


