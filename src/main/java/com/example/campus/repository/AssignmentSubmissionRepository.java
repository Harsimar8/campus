package com.example.campus.repository;

import com.example.campus.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignmentId = :assignmentId AND s.studentId = :studentId")
    AssignmentSubmission findByAssignmentIdAndStudentId(@Param("assignmentId") Long assignmentId, @Param("studentId") Long studentId);

    @Query("SELECT s FROM AssignmentSubmission s WHERE s.status = 'SUBMITTED' AND s.assignmentId = :assignmentId")
    List<AssignmentSubmission> findPendingSubmissionsByAssignment(@Param("assignmentId") Long assignmentId);
}
