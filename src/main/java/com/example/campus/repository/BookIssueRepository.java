package com.example.campus.repository;

import com.example.campus.entity.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {
    List<BookIssue> findByStudentId(Long studentId);
    List<BookIssue> findByBookId(Long bookId);
    List<BookIssue> findByStatus(BookIssue.IssueStatus status);
    
    @Query("SELECT bi FROM BookIssue bi WHERE bi.studentId = :studentId AND bi.status = 'ISSUED'")
    List<BookIssue> findActiveIssuesByStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT bi FROM BookIssue bi WHERE bi.dueDate < :currentDate AND bi.status = 'ISSUED'")
    List<BookIssue> findOverdueBooks(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT bi FROM BookIssue bi WHERE bi.bookId = :bookId AND bi.status = 'ISSUED'")
    List<BookIssue> findActiveIssuesByBook(@Param("bookId") Long bookId);
}
