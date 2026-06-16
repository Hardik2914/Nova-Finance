package com.raycast.hub.repository;

import com.raycast.hub.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUserId(Long userId);
    
    List<Transaction> findByUserIdAndCategoryIgnoreCase(Long userId, String category);
    
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND LOWER(t.category) = LOWER(:category) AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndCategoryAndDateBetween(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Transaction> findByCategoryIgnoreCase(String category);
    
    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Transaction t WHERE LOWER(t.category) = LOWER(:category) AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByCategoryAndDateBetween(
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
