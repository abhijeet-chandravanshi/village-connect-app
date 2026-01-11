package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Expense;
import com.unicclub.backend.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByFestival(Festival festival);
    
    List<Expense> findByFestivalOrderByExpenseDateDesc(Festival festival);
    
    List<Expense> findByCategory(String category);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.festival = :festival")
    BigDecimal sumAmountByFestival(Festival festival);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.festival = :festival GROUP BY e.category")
    List<Object[]> sumAmountByFestivalGroupByCategory(Festival festival);
    
    @Query("SELECT DISTINCT e.category FROM Expense e")
    List<String> findDistinctCategories();
}


