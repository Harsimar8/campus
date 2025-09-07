package com.example.campus.repository;

import com.example.campus.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubject(Long studentId, String subject);
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.studentId = :studentId AND a.date = :date")
    List<Attendance> findByStudentIdAndDate(@Param("studentId") Long studentId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.subject = :subject AND a.status = 'PRESENT'")
    Long countPresentByStudentAndSubject(@Param("studentId") Long studentId, @Param("subject") String subject);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.subject = :subject")
    Long countTotalByStudentAndSubject(@Param("studentId") Long studentId, @Param("subject") String subject);
}
