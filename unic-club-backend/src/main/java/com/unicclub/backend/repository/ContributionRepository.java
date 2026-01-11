package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Contribution;
import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    
    List<Contribution> findByUser(User user);
    
    List<Contribution> findByUserOrderByCreatedAtDesc(User user);
    
    List<Contribution> findByFestival(Festival festival);
    
    List<Contribution> findByFestivalAndStatus(Festival festival, Contribution.Status status);
    
    List<Contribution> findByStatus(Contribution.Status status);
    
    @Query("SELECT c FROM Contribution c WHERE c.status = 'PENDING' ORDER BY c.createdAt ASC")
    List<Contribution> findPendingContributions();
    
    @Query("SELECT SUM(c.amount) FROM Contribution c WHERE c.festival = :festival AND c.status = 'VERIFIED'")
    BigDecimal sumVerifiedAmountByFestival(Festival festival);
    
    @Query("SELECT COUNT(DISTINCT c.user) FROM Contribution c WHERE c.festival = :festival AND c.status = 'VERIFIED'")
    long countDistinctContributorsByFestival(Festival festival);
    
    @Query("SELECT SUM(c.amount) FROM Contribution c WHERE c.user = :user AND c.status = 'VERIFIED'")
    BigDecimal sumVerifiedAmountByUser(User user);
    
    @Query("SELECT c FROM Contribution c ORDER BY c.createdAt DESC")
    List<Contribution> findRecentContributions();
    
    boolean existsByUserAndFestival(User user, Festival festival);
}


