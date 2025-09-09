package com.example.campus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 200)
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @NotNull
    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role")
    private TargetRole targetRole;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", columnDefinition = "DATE") // ✅ explicitly map to DATE
    private LocalDate createdAt;

    @Column(name = "updated_at", columnDefinition = "DATE") // ✅ explicitly map to DATE
    private LocalDate updatedAt;

    public enum TargetRole {
        ALL, STUDENT, FACULTY, ADMIN
    }

    @PrePersist
    protected void onCreate() {
        LocalDate today = LocalDate.now();
        this.createdAt = today;
        this.updatedAt = today;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public TargetRole getTargetRole() { return targetRole; }
    public void setTargetRole(TargetRole targetRole) { this.targetRole = targetRole; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}
