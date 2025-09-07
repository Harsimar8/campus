package com.example.campus.repository;

import com.example.campus.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentId(Long studentId);
    List<Fee> findByStudentIdAndStatus(Long studentId, Fee.PaymentStatus status);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.studentId = :studentId AND f.status = 'PAID'")
    BigDecimal calculateTotalPaid(@Param("studentId") Long studentId);
    
    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.studentId = :studentId AND f.status = 'PENDING'")
    BigDecimal calculateTotalPending(@Param("studentId") Long studentId);
}
