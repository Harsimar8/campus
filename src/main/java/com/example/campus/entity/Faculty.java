package com.example.campus.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "faculty")
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeId;

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
    private String designation;

    @Column(nullable = false)
    private String qualification;

    @Column(nullable = false)
    private String experience;

    @Column(nullable = false)
    private String coursesTaught;

    // Constructors
    public Faculty() {}

    public Faculty(String employeeId, String name, String department, String email, 
                   String phone, String address, String designation, String qualification, 
                   String experience, String coursesTaught) {
        this.employeeId = employeeId;
        this.name = name;
        this.department = department;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.designation = designation;
        this.qualification = qualification;
        this.experience = experience;
        this.coursesTaught = coursesTaught;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

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

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getCoursesTaught() { return coursesTaught; }
    public void setCoursesTaught(String coursesTaught) { this.coursesTaught = coursesTaught; }
}
