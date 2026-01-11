package com.unicclub.backend.config;

import com.unicclub.backend.entity.*;
import com.unicclub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("never")  // Disabled temporarily - table creation issues with H2
public class DataInitializer {
    
    private final UserRepository userRepository;
    private final FestivalRepository festivalRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;
    private final NotificationRepository notificationRepository;
    
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initData() {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping data initialization");
            return;
        }
        
        log.info("Initializing database with sample data...");
        
        // Create Users
        User superAdmin = userRepository.save(User.builder()
                .phone("9876543210")
                .name("राम कुमार")
                .nameEn("Ram Kumar")
                .ward("वार्ड 1")
                .wardEn("Ward 1")
                .dateOfBirth(LocalDate.of(1985, 5, 15))
                .role(User.Role.SUPER_ADMIN)
                .build());
        
        User admin = userRepository.save(User.builder()
                .phone("9876543211")
                .name("श्याम यादव")
                .nameEn("Shyam Yadav")
                .ward("वार्ड 2")
                .wardEn("Ward 2")
                .dateOfBirth(LocalDate.of(1990, 11, 2))
                .role(User.Role.ADMIN)
                .build());
        
        User user1 = userRepository.save(User.builder()
                .phone("9876543212")
                .name("मोहन सिंह")
                .nameEn("Mohan Singh")
                .ward("वार्ड 1")
                .wardEn("Ward 1")
                .dateOfBirth(LocalDate.of(1988, 3, 20))
                .role(User.Role.USER)
                .build());
        
        User user2 = userRepository.save(User.builder()
                .phone("9876543213")
                .name("सुनील कुमार")
                .nameEn("Sunil Kumar")
                .ward("वार्ड 3")
                .wardEn("Ward 3")
                .dateOfBirth(LocalDate.of(1992, 7, 8))
                .role(User.Role.USER)
                .build());
        
        log.info("Created {} users", userRepository.count());
        
        // Create Festivals
        Festival chhathPuja = festivalRepository.save(Festival.builder()
                .name("छठ पूजा")
                .nameEn("Chhath Puja")
                .description("गांव के घाट पर छठ पूजा का भव्य आयोजन। सभी ग्रामवासियों का स्वागत है।")
                .year(2026)
                .startDate(LocalDate.of(2026, 11, 7))
                .endDate(LocalDate.of(2026, 11, 10))
                .expectedBudget(new BigDecimal("35000"))
                .imageUrl("https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800")
                .status(Festival.Status.ONGOING)
                .build());
        
        Festival durgaPuja = festivalRepository.save(Festival.builder()
                .name("दुर्गा पूजा")
                .nameEn("Durga Puja")
                .description("माँ दुर्गा की भव्य पूजा का आयोजन। पंडाल सजावट और भोग प्रसाद।")
                .year(2026)
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 5))
                .expectedBudget(new BigDecimal("50000"))
                .imageUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800")
                .status(Festival.Status.COMPLETED)
                .build());
        
        Festival holi = festivalRepository.save(Festival.builder()
                .name("होली मिलन")
                .nameEn("Holi Celebration")
                .description("रंगों का त्योहार होली मिलन समारोह। गुलाल और मिठाई वितरण।")
                .year(2026)
                .startDate(LocalDate.of(2026, 3, 14))
                .endDate(LocalDate.of(2026, 3, 15))
                .expectedBudget(new BigDecimal("25000"))
                .imageUrl("https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=800")
                .status(Festival.Status.UPCOMING)
                .build());
        
        log.info("Created {} festivals", festivalRepository.count());
        
        // Create Contributions
        Contribution c1 = contributionRepository.save(Contribution.builder()
                .user(superAdmin)
                .festival(chhathPuja)
                .amount(new BigDecimal("1001"))
                .paymentMethod(Contribution.PaymentMethod.UPI)
                .transactionId("UPI123456789")
                .status(Contribution.Status.VERIFIED)
                .verifiedBy(admin)
                .verifiedAt(LocalDateTime.now().minusDays(5))
                .build());
        
        Contribution c2 = contributionRepository.save(Contribution.builder()
                .user(admin)
                .festival(chhathPuja)
                .amount(new BigDecimal("500"))
                .paymentMethod(Contribution.PaymentMethod.UPI)
                .transactionId("UPI987654321")
                .status(Contribution.Status.VERIFIED)
                .verifiedBy(superAdmin)
                .verifiedAt(LocalDateTime.now().minusDays(4))
                .build());
        
        Contribution c3 = contributionRepository.save(Contribution.builder()
                .user(user1)
                .festival(chhathPuja)
                .amount(new BigDecimal("251"))
                .paymentMethod(Contribution.PaymentMethod.UPI)
                .transactionId("UPI456789123")
                .status(Contribution.Status.PENDING)
                .build());
        
        log.info("Created {} contributions", contributionRepository.count());
        
        // Create Expenses
        expenseRepository.save(Expense.builder()
                .festival(chhathPuja)
                .description("टेंट और पंडाल")
                .category("Infrastructure")
                .amount(new BigDecimal("8000"))
                .paidTo("रामू टेंट हाउस")
                .expenseDate(LocalDate.now().minusDays(2))
                .addedBy(superAdmin)
                .build());
        
        expenseRepository.save(Expense.builder()
                .festival(chhathPuja)
                .description("फूल और माला")
                .category("Decoration")
                .amount(new BigDecimal("3000"))
                .paidTo("गांव फूलवाला")
                .expenseDate(LocalDate.now().minusDays(1))
                .addedBy(superAdmin)
                .build());
        
        log.info("Created {} expenses", expenseRepository.count());
        
        // Create Notifications
        notificationRepository.save(Notification.builder()
                .title("छठ पूजा योगदान अनुरोध")
                .message("छठ पूजा 2026 के लिए योगदान शुरू हो गया है। कृपया अपना सहयोग दें।")
                .type(Notification.Type.FESTIVAL)
                .createdBy(superAdmin)
                .build());
        
        notificationRepository.save(Notification.builder()
                .title("योगदान सत्यापित")
                .message("आपका ₹1,001 का योगदान सफलतापूर्वक सत्यापित हो गया है। धन्यवाद!")
                .type(Notification.Type.CONTRIBUTION)
                .targetUser(superAdmin)
                .createdBy(admin)
                .build());
        
        log.info("Created {} notifications", notificationRepository.count());
        
        log.info("Database initialization completed!");
    }
}


