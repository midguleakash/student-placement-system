
package com.akash.placement.model;

import com.akash.placement.enums.ApplicationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "job_applications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_application_job_student",
                        columnNames = {"job_id", "student_user_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_application_student",
                        columnList = "student_user_id"
                ),
                @Index(
                        name = "idx_application_job",
                        columnList = "job_id"
                ),
                @Index(
                        name = "idx_application_status",
                        columnList = "status"
                )
        }
)
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "student_user_id", nullable = false)
    private Long studentUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 1000)
    private String statusRemarks;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        appliedAt = now;
        updatedAt = now;

        if (status == null) {
            status = ApplicationStatus.APPLIED;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getStudentUserId() {
        return studentUserId;
    }

    public void setStudentUserId(Long studentUserId) {
        this.studentUserId = studentUserId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getStatusRemarks() {
        return statusRemarks;
    }

    public void setStatusRemarks(String statusRemarks) {
        this.statusRemarks = statusRemarks;
    }
}
