package com.example.campus.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer credits;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String academicYear;

    // Constructors
    public Subject() {}

    public Subject(String subjectCode, String subjectName, String department, 
                   Integer credits, String semester, String academicYear) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.department = department;
        this.credits = credits;
        this.semester = semester;
        this.academicYear = academicYear;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
