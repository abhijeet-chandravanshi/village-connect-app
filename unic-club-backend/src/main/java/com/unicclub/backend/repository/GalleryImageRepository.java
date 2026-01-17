package com.unicclub.backend.repository;

import com.unicclub.backend.entity.Festival;
import com.unicclub.backend.entity.GalleryImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
    
    // Eagerly fetch festival and uploadedBy to avoid LazyInitializationException
    @Query("SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.festival = :festival ORDER BY g.createdAt DESC")
    List<GalleryImage> findByFestival(@Param("festival") Festival festival);
    
    @Query("SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.year = :year ORDER BY g.createdAt DESC")
    List<GalleryImage> findByYear(@Param("year") Integer year);
    
    @Query("SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.festival = :festival AND g.year = :year ORDER BY g.createdAt DESC")
    List<GalleryImage> findByFestivalAndYear(@Param("festival") Festival festival, @Param("year") Integer year);
    
    @Query("SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy ORDER BY g.year DESC, g.createdAt DESC")
    List<GalleryImage> findAllOrderByYearDesc();
    
    // Pageable methods
    @Query(value = "SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy",
           countQuery = "SELECT COUNT(g) FROM GalleryImage g")
    Page<GalleryImage> findAllWithPagination(Pageable pageable);
    
    @Query(value = "SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.year = :year",
           countQuery = "SELECT COUNT(g) FROM GalleryImage g WHERE g.year = :year")
    Page<GalleryImage> findByYearWithPagination(@Param("year") Integer year, Pageable pageable);
    
    @Query(value = "SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.festival = :festival",
           countQuery = "SELECT COUNT(g) FROM GalleryImage g WHERE g.festival = :festival")
    Page<GalleryImage> findByFestivalWithPagination(@Param("festival") Festival festival, Pageable pageable);
    
    @Query("SELECT DISTINCT g.year FROM GalleryImage g ORDER BY g.year DESC")
    List<Integer> findDistinctYears();
    
    // Override findById to eagerly fetch relationships
    @Query("SELECT g FROM GalleryImage g JOIN FETCH g.festival LEFT JOIN FETCH g.uploadedBy WHERE g.id = :id")
    Optional<GalleryImage> findByIdWithRelations(@Param("id") Long id);
    
    long countByFestival(Festival festival);
}


