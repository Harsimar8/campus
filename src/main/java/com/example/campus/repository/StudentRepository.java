package com.example.campus.repository;

import com.example.campus.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByEmail(String email);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByEmail(String email);
}
