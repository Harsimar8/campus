package com.example.campus.repository;

import com.example.campus.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findBySubject(String subject);
    List<Assignment> findByAssignedBy(String assignedBy);

    @Query("SELECT a FROM Assignment a WHERE a.classId = :classId AND (a.dueDate IS NULL OR a.dueDate > :currentTime) ORDER BY a.dueDate ASC")
    List<Assignment> findUpcomingAssignmentsByClassId(@Param("classId") Long classId, @Param("currentTime") LocalDateTime currentTime);


    @Query("SELECT a FROM Assignment a WHERE a.dueDate < :currentTime ORDER BY a.dueDate DESC")
    List<Assignment> findPastAssignments(@Param("currentTime") LocalDateTime currentTime);
}
