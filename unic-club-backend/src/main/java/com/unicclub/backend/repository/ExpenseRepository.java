package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Expense;
import com.unicclub.backend.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    // Eagerly fetch festival and addedBy to avoid LazyInitializationException
    @Query("SELECT e FROM Expense e JOIN FETCH e.festival JOIN FETCH e.addedBy WHERE e.festival = :festival ORDER BY e.expenseDate DESC")
    List<Expense> findByFestival(@Param("festival") Festival festival);
    
    @Query("SELECT e FROM Expense e JOIN FETCH e.festival JOIN FETCH e.addedBy WHERE e.festival = :festival ORDER BY e.expenseDate DESC")
    List<Expense> findByFestivalOrderByExpenseDateDesc(@Param("festival") Festival festival);
    
    @Query("SELECT e FROM Expense e JOIN FETCH e.festival JOIN FETCH e.addedBy WHERE e.category = :category ORDER BY e.expenseDate DESC")
    List<Expense> findByCategory(@Param("category") String category);
    
    @Query("SELECT e FROM Expense e JOIN FETCH e.festival JOIN FETCH e.addedBy ORDER BY e.expenseDate DESC")
    List<Expense> findAllWithRelations();
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.festival = :festival")
    BigDecimal sumAmountByFestival(@Param("festival") Festival festival);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.festival = :festival GROUP BY e.category")
    List<Object[]> sumAmountByFestivalGroupByCategory(@Param("festival") Festival festival);
    
    @Query("SELECT DISTINCT e.category FROM Expense e")
    List<String> findDistinctCategories();
    
    // Find by ID with eager fetch
    @Query("SELECT e FROM Expense e JOIN FETCH e.festival JOIN FETCH e.addedBy WHERE e.id = :id")
    Optional<Expense> findByIdWithRelations(@Param("id") Long id);
}


