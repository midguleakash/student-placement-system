
package com.akash.placement.dto;

import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.model.JobApplication;

import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long studentUserId,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt,
        String statusRemarks
) {
    public static ApplicationResponse from(
            JobApplication application,
            String jobTitle,
            String companyName) {

        return new ApplicationResponse(
                application.getId(),
                application.getJobId(),
                jobTitle,
                companyName,
                application.getStudentUserId(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getUpdatedAt(),
                application.getStatusRemarks()
        );
    }
}
