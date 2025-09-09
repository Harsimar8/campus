package com.example.campus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
public class Fee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @NotNull
    @Column(name = "fee_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private FeeType feeType;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_id")
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    public enum FeeType {
        TUITION, LIBRARY, LAB, EXAM, TRANSPORT, HOSTEL, OTHER
    }

    public enum PaymentStatus {
        PENDING, PAID, OVERDUE, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (status == null) {
            status = PaymentStatus.PENDING;
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

    public FeeType getFeeType() { return feeType; }
    public void setFeeType(FeeType feeType) { this.feeType = feeType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}
