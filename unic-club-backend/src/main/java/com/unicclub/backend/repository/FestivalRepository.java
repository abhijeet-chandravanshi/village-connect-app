package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FestivalRepository extends JpaRepository<Festival, Long> {
    
    List<Festival> findByStatus(Festival.Status status);
    
    List<Festival> findByYear(Integer year);
    
    List<Festival> findByYearOrderByStartDateAsc(Integer year);
    
    @Query("SELECT f FROM Festival f WHERE f.status IN ('UPCOMING', 'ONGOING') ORDER BY f.startDate ASC")
    List<Festival> findActiveFestivals();
    
    @Query("SELECT f FROM Festival f ORDER BY f.year DESC, f.startDate DESC")
    List<Festival> findAllOrderByYearDesc();
    
    @Query("SELECT DISTINCT f.year FROM Festival f ORDER BY f.year DESC")
    List<Integer> findDistinctYears();
    
    List<Festival> findByNameContainingIgnoreCaseOrNameEnContainingIgnoreCase(String name, String nameEn);
}


