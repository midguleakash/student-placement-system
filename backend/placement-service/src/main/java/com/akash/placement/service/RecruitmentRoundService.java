
package com.akash.placement.service;

import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.enums.RecruitmentRoundStatus;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.model.Job;
import com.akash.placement.model.JobApplication;
import com.akash.placement.model.RecruitmentRound;
import com.akash.placement.repository.CompanyProfileRepository;
import com.akash.placement.repository.JobApplicationRepository;
import com.akash.placement.repository.JobRepository;
import com.akash.placement.repository.RecruitmentRoundRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RecruitmentRoundService {

    private static final int ROUND_ONE = 1;
    private static final String ROUND_ONE_NAME = "Resume Screening";

    private final CompanyProfileRepository companyProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final RecruitmentRoundRepository recruitmentRoundRepository;

    public RecruitmentRoundService(
            CompanyProfileRepository companyProfileRepository,
            JobApplicationRepository jobApplicationRepository,
            JobRepository jobRepository,
            RecruitmentRoundRepository recruitmentRoundRepository) {

        this.companyProfileRepository = companyProfileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
        this.recruitmentRoundRepository = recruitmentRoundRepository;
    }

    /**
     * Creates Round 1 if it does not exist.
     * Repeated calls return the existing Round 1 record.
     */
    @Transactional
    public RecruitmentRound createRoundOne(
            Long applicationId,
            Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);

        JobApplication application = getApplication(applicationId);

        Job job = getJob(application.getJobId());

        verifyJobOwnership(job, company);

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId,
                        ROUND_ONE
                )
                .orElseGet(() ->
                        recruitmentRoundRepository.save(
                                new RecruitmentRound(
                                        application,
                                        ROUND_ONE,
                                        ROUND_ONE_NAME
                                )
                        )
                );
    }

    /**
     * Saves the company's Round 1 decision and synchronizes
     * the overall application status.
     */
    @Transactional
    public RecruitmentRound decideRoundOne(
            Long applicationId,
            Long companyUserId,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score) {

        CompanyProfile company = getApprovedCompany(companyUserId);

        JobApplication application = getApplication(applicationId);

        Job job = getJob(application.getJobId());

        verifyJobOwnership(job, company);

        if (decision != RecruitmentRoundStatus.SHORTLISTED
                && decision != RecruitmentRoundStatus.REJECTED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Round 1 decision must be SHORTLISTED or REJECTED."
            );
        }

        if (score != null
                && (score.compareTo(BigDecimal.ZERO) < 0
                || score.compareTo(new BigDecimal("100")) > 0)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Score must be between 0 and 100."
            );
        }

        // Do not reopen a terminal application accidentally.
        if (application.getStatus() == ApplicationStatus.HIRED
                || application.getStatus() == ApplicationStatus.SELECTED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The application has already reached a final selection status."
            );
        }

        RecruitmentRound round = recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId,
                        ROUND_ONE
                )
                .orElseGet(() ->
                        new RecruitmentRound(
                                application,
                                ROUND_ONE,
                                ROUND_ONE_NAME
                        )
                );

        // Persist the round-level decision.
        round.setStatus(decision);
        round.setFeedback(feedback);
        round.setScore(score);
        round.setEvaluatedBy(companyUserId);
        round.setEvaluatedAt(LocalDateTime.now());

        RecruitmentRound savedRound =
                recruitmentRoundRepository.save(round);

        // Synchronize the overall application status.
        if (decision == RecruitmentRoundStatus.SHORTLISTED) {
            application.setStatus(ApplicationStatus.SHORTLISTED);
        } else {
            application.setStatus(ApplicationStatus.REJECTED);
        }

        application.setStatusRemarks(feedback);
        jobApplicationRepository.save(application);

        return savedRound;
    }

    private CompanyProfile getApprovedCompany(Long companyUserId) {

        CompanyProfile company = companyProfileRepository
                .findByUserId(companyUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Company profile not found."
                ));

        if (company.getProfileStatus() == null
                || !"APPROVED".equals(
                company.getProfileStatus().toString())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Company profile must be approved."
            );
        }

        return company;
    }

    private JobApplication getApplication(Long applicationId) {

        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Application not found."
                ));
    }

    private Job getJob(Long jobId) {

        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found."
                ));
    }

    private void verifyJobOwnership(
            Job job,
            CompanyProfile company) {

        if (!company.getId().equals(job.getCompanyId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot manage applications for another company's job."
            );
        }
    }
}
