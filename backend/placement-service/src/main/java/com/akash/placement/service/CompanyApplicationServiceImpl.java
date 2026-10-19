
package com.akash.placement.service;

import com.akash.placement.dto.CompanyApplicationResponse;
import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.exception.ResourceNotFoundException;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.model.Job;
import com.akash.placement.model.JobApplication;
import com.akash.placement.repository.CompanyProfileRepository;
import com.akash.placement.repository.JobApplicationRepository;
import com.akash.placement.repository.JobRepository;
import com.akash.placement.service.CompanyApplicationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class CompanyApplicationServiceImpl
        implements CompanyApplicationService {

    private final CompanyProfileRepository companyProfileRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicantDetailsClient applicantDetailsClient;


    public CompanyApplicationServiceImpl(
            CompanyProfileRepository companyProfileRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository, ApplicantDetailsClient applicantDetailsClient
    ) {
        this.companyProfileRepository = companyProfileRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.applicantDetailsClient = applicantDetailsClient;
    }

    @Override
    public List<CompanyApplicationResponse> getCompanyApplications(
            Long userId,
            Long jobId,
            ApplicationStatus status,
            String search,
            LocalDate appliedFrom,
            LocalDate appliedTo
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Authenticated user ID is required."
            );
        }

        if (appliedFrom != null
                && appliedTo != null
                && appliedFrom.isAfter(appliedTo)) {
            throw new IllegalArgumentException(
                    "Applied-from date cannot be after applied-to date."
            );
        }

        CompanyProfile company = companyProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Company profile not found."
                ));

        if (company.getProfileStatus() != CompanyProfileStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Your company profile must be approved to view applications."
            );
        }

        // job.companyId stores the COMPANY PROFILE ID.
        if (jobId != null) {
            jobRepository.findByIdAndCompanyId(jobId, company.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Job not found for your company."
                    ));
        }

        LocalDateTime from = appliedFrom == null
                ? null
                : appliedFrom.atStartOfDay();

        LocalDateTime toExclusive = appliedTo == null
                ? null
                : appliedTo.plusDays(1).atStartOfDay();

        String searchText = search == null
                ? ""
                : search.trim().toLowerCase(Locale.ROOT);

        List<Job> companyJobs =
                jobRepository.findByCompanyIdOrderByCreatedAtDesc(
                        company.getId()
                );

        return companyJobs.stream()
                .filter(job -> jobId == null || job.getId().equals(jobId))
                .flatMap(job ->
                        jobApplicationRepository
                                .findByJobIdOrderByAppliedAtDesc(job.getId())
                                .stream()
                                .filter(application ->
                                        matchesFilters(
                                                application,
                                                job,
                                                status,
                                                searchText,
                                                from,
                                                toExclusive
                                        )
                                )
                                .map(application -> {
                                    Long studentUserId = application.getStudentUserId();

                                    String studentName =
                                            applicantDetailsClient.getStudentName(studentUserId);

                                    String studentEmail =
                                            applicantDetailsClient.getStudentEmail(studentUserId);

                                    return CompanyApplicationResponse.from(
                                            application,
                                            job.getTitle(),
                                            company.getCompanyName(),
                                            studentName,
                                            studentEmail
                                    );
                                })
                )
                .toList();
    }

    private boolean matchesFilters(
            JobApplication application,
            Job job,
            ApplicationStatus status,
            String search,
            LocalDateTime from,
            LocalDateTime toExclusive
    ) {
        if (status != null && application.getStatus() != status) {
            return false;
        }

        if (from != null && application.getAppliedAt().isBefore(from)) {
            return false;
        }

        if (toExclusive != null
                && !application.getAppliedAt().isBefore(toExclusive)) {
            return false;
        }

        if (!search.isBlank()) {
            String jobTitle = job.getTitle() == null
                    ? ""
                    : job.getTitle().toLowerCase(Locale.ROOT);

            String studentId =
                    String.valueOf(application.getStudentUserId());

            return jobTitle.contains(search)
                    || studentId.contains(search);
        }

        return true;
    }
}
