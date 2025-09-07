package com.example.campus.repository;

import com.example.campus.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    List<Subject> findByDepartment(String department);
    List<Subject> findBySemester(String semester);
    List<Subject> findByAcademicYear(String academicYear);
    boolean existsBySubjectCode(String subjectCode);
}
