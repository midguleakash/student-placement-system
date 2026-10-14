package com.akash.student.dto;

import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;

import java.time.LocalDateTime;

public record StudentProfileResponse(
        Long id,
        Long userId,
        String firstName,
        String lastName,
        String phone,
        String branch,
        Integer graduationYear,
        Double cgpa,
        Integer activeBacklogs,
        String skills,
        String resumeUrl,
        ProfileStatus profileStatus,
        String rejectionRemarks,
        LocalDateTime profileSubmittedAt,
        LocalDateTime profileReviewedAt
) {

    public static StudentProfileResponse from(StudentProfile profile) {
        return new StudentProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getPhone(),
                profile.getBranch(),
                profile.getGraduationYear(),
                profile.getCgpa(),
                profile.getActiveBacklogs(),
                profile.getSkills(),
                profile.getResumeUrl(),
                profile.getProfileStatus(),
                profile.getRejectionRemarks(),
                profile.getProfileSubmittedAt(),
                profile.getProfileReviewedAt()
        );
    }
}