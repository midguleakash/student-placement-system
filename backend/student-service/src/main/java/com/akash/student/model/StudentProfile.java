package com.akash.student.model;

import com.akash.student.enums.ProfileStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(
        name = "student_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_student_profile_user_id",
                        columnNames = "user_id"
                )
        }
)
public class StudentProfile {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String branch;

    private Integer graduationYear;

    private Double cgpa;

    private Integer activeBacklogs;

    @Column(length = 2000)
    private String skills;

    @Column(name = "resume_url", length = 1000)
    private String resumeUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_status", nullable = false, length = 20)
    private ProfileStatus profileStatus = ProfileStatus.INCOMPLETE;

    @Column(name = "rejection_remarks", length = 1000)
    private String rejectionRemarks;

    @Column(name = "profile_submitted_at")
    private LocalDateTime profileSubmittedAt;

    @Column(name = "profile_reviewed_at")
    private LocalDateTime profileReviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (profileStatus == null) {
            profileStatus = ProfileStatus.INCOMPLETE;
        }
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Integer getActiveBacklogs() {
        return activeBacklogs;
    }

    public void setActiveBacklogs(Integer activeBacklogs) {
        this.activeBacklogs = activeBacklogs;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public ProfileStatus getProfileStatus() {
        return profileStatus;
    }

    public void setProfileStatus(ProfileStatus profileStatus) {
        this.profileStatus = profileStatus;
    }

    public String getRejectionRemarks() {
        return rejectionRemarks;
    }

    public void setRejectionRemarks(String rejectionRemarks) {
        this.rejectionRemarks = rejectionRemarks;
    }

    public LocalDateTime getProfileSubmittedAt() {
        return profileSubmittedAt;
    }

    public void setProfileSubmittedAt(LocalDateTime profileSubmittedAt) {
        this.profileSubmittedAt = profileSubmittedAt;
    }

    public LocalDateTime getProfileReviewedAt() {
        return profileReviewedAt;
    }

    public void setProfileReviewedAt(LocalDateTime profileReviewedAt) {
        this.profileReviewedAt = profileReviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}