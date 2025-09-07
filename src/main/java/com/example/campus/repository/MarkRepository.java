package com.example.campus.repository;

import com.example.campus.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByStudentIdAndSubject(Long studentId, String subject);
    List<Mark> findByStudentIdAndSemester(Long studentId, String semester);
    
    @Query("SELECT AVG(m.marksObtained) FROM Mark m WHERE m.studentId = :studentId AND m.semester = :semester")
    Double calculateSGPA(@Param("studentId") Long studentId, @Param("semester") String semester);
    
    @Query("SELECT AVG(m.marksObtained) FROM Mark m WHERE m.studentId = :studentId")
    Double calculateCGPA(@Param("studentId") Long studentId);
}
