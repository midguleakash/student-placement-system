
package com.akash.placement.dto;

import com.akash.placement.enums.JobStatus;
import com.akash.placement.model.Job;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobResponse(
        Long id,
        Long companyId,
        String title,
        String description,
        String requiredSkills,
        BigDecimal minimumCgpa,
        Integer maximumActiveBacklogs,
        String eligibleGraduationYears,
        BigDecimal salary,
        String location,
        String workMode,
        Integer vacancies,
        LocalDateTime applicationDeadline,
        JobStatus status,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static JobResponse from(Job job) {
        return new JobResponse(
                job.getId(),
                job.getCompanyId(),
                job.getTitle(),
                job.getDescription(),
                job.getRequiredSkills(),
                job.getMinimumCgpa(),
                job.getMaximumActiveBacklogs(),
                job.getEligibleGraduationYears(),
                job.getSalary(),
                job.getLocation(),
                job.getWorkMode(),
                job.getVacancies(),
                job.getApplicationDeadline(),
                job.getStatus(),
                job.getPublishedAt(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
