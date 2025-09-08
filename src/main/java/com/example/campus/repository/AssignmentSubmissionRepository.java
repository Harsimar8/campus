package com.example.campus.repository;

import com.example.campus.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    // 🔹 Student: View all their submissions
    List<AssignmentSubmission> findByStudentId(Long studentId);

    // 🔹 Faculty: View all submissions for a specific assignment
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    // 🔹 Faculty/Student: Find specific submission (unique student+assignment)
    @Query("SELECT s FROM AssignmentSubmission s " +
            "WHERE s.assignmentId = :assignmentId AND s.studentId = :studentId")
    AssignmentSubmission findByAssignmentIdAndStudentId(@Param("assignmentId") Long assignmentId,
                                                        @Param("studentId") Long studentId);

    // 🔹 Faculty: View only submitted (pending grading) submissions
    @Query("SELECT s FROM AssignmentSubmission s " +
            "WHERE s.status = 'SUBMITTED' AND s.assignmentId = :assignmentId")
    List<AssignmentSubmission> findPendingSubmissionsByAssignment(@Param("assignmentId") Long assignmentId);

    // 🔹 Faculty: View already graded submissions
    @Query("SELECT s FROM AssignmentSubmission s " +
            "WHERE s.status = 'GRADED' AND s.assignmentId = :assignmentId")
    List<AssignmentSubmission> findGradedSubmissionsByAssignment(@Param("assignmentId") Long assignmentId);
}
