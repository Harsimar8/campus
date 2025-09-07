package com.example.campus.repository;

import com.example.campus.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByStudentId(Long studentId);
    List<Feedback> findByStatus(Feedback.Status status);
    List<Feedback> findByCategory(Feedback.Category category);
    
    @Query("SELECT f FROM Feedback f WHERE f.status = 'PENDING' ORDER BY f.createdAt ASC")
    List<Feedback> findPendingFeedback();
}
