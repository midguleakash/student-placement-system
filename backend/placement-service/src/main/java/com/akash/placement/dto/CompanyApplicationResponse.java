package com.akash.placement.dto;

import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.model.JobApplication;

import java.time.LocalDateTime;

public record CompanyApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long studentUserId,
        String studentName,
        String studentEmail,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt,
        String statusRemarks
) {
    public static CompanyApplicationResponse from(
            JobApplication application,
            String jobTitle,
            String companyName,
            String studentName,
            String studentEmail
    ) {
        return new CompanyApplicationResponse(
                application.getId(),
                application.getJobId(),
                jobTitle,
                companyName,
                application.getStudentUserId(),
                studentName,
                studentEmail,
                application.getStatus(),
                application.getAppliedAt(),
                application.getUpdatedAt(),
                application.getStatusRemarks()
        );
    }
}