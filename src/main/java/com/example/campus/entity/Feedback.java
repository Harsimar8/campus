package com.example.campus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @NotNull
    @Size(min = 3, max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @NotNull
    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "responded_by")
    private String respondedBy;

    @Column(name = "responded_at")
    private LocalDate respondedAt;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    public enum Category {
        ACADEMIC, TECHNICAL, FACILITY, GENERAL
    }

    public enum Status {
        PENDING, IN_PROGRESS, RESOLVED, CLOSED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (status == null) {
            status = Status.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public String getRespondedBy() { return respondedBy; }
    public void setRespondedBy(String respondedBy) { this.respondedBy = respondedBy; }

    public LocalDate getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDate respondedAt) { this.respondedAt = respondedAt; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}
