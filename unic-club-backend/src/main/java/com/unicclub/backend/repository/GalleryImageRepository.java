package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
    
    List<GalleryImage> findByFestival(Festival festival);
    
    List<GalleryImage> findByYear(Integer year);
    
    List<GalleryImage> findByFestivalAndYear(Festival festival, Integer year);
    
    @Query("SELECT g FROM GalleryImage g ORDER BY g.year DESC, g.createdAt DESC")
    List<GalleryImage> findAllOrderByYearDesc();
    
    @Query("SELECT DISTINCT g.year FROM GalleryImage g ORDER BY g.year DESC")
    List<Integer> findDistinctYears();
    
    long countByFestival(Festival festival);
}


