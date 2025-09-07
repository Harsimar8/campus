package com.example.campus.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String rollNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double cgpa;

    @Column(nullable = false)
    private Double sgpaSem1;

    @Column(nullable = false)
    private Double sgpaSem2;

    @Column(nullable = false)
    private Double sgpaSem3;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String semester;

    // Constructors
    public Student() {}

    public Student(String rollNumber, String name, String department, String email,
                   String phone, String address, Double cgpa, Double sgpaSem1,
                   Double sgpaSem2, Double sgpaSem3, String academicYear, String semester) {
        this.rollNumber = rollNumber;
        this.name = name;
        this.department = department;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.cgpa = cgpa;
        this.sgpaSem1 = sgpaSem1;
        this.sgpaSem2 = sgpaSem2;
        this.sgpaSem3 = sgpaSem3;
        this.academicYear = academicYear;
        this.semester = semester;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Double getSgpaSem1() { return sgpaSem1; }
    public void setSgpaSem1(Double sgpaSem1) { this.sgpaSem1 = sgpaSem1; }

    public Double getSgpaSem2() { return sgpaSem2; }
    public void setSgpaSem2(Double sgpaSem2) { this.sgpaSem2 = sgpaSem2; }

    public Double getSgpaSem3() { return sgpaSem3; }
    public void setSgpaSem3(Double sgpaSem3) { this.sgpaSem3 = sgpaSem3; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
}
