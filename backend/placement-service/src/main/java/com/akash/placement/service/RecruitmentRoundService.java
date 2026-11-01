
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
import java.util.List;

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

    @Transactional
    public RecruitmentRound createRoundTwo(Long applicationId, Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        Job job = getJob(application.getJobId());

        verifyJobOwnership(job, company);

        if (application.getStatus() == ApplicationStatus.REJECTED
                || application.getStatus() == ApplicationStatus.SELECTED
                || application.getStatus() == ApplicationStatus.HIRED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This application is closed and cannot proceed to Round 2."
            );
        }

        RecruitmentRound roundOne = recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(applicationId, 1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Round 1 must be completed before starting Round 2."
                ));

        if (roundOne.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The candidate must pass Round 1 before starting Round 2."
            );
        }

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(applicationId, 2)
                .orElseGet(() -> recruitmentRoundRepository.save(
                        new RecruitmentRound(
                                application,
                                2,
                                "Technical Interview"
                        )
                ));
    }



    @Transactional
    public RecruitmentRound decideRoundTwo(
            Long applicationId,
            Long companyUserId,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score
    ) {
        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        Job job = getJob(application.getJobId());

        verifyJobOwnership(job, company);

        if (application.getStatus() == ApplicationStatus.REJECTED
                || application.getStatus() == ApplicationStatus.SELECTED
                || application.getStatus() == ApplicationStatus.HIRED) {
            throw new IllegalStateException(
                    "This application is already closed."
            );
        }

        if (decision != RecruitmentRoundStatus.SHORTLISTED
                && decision != RecruitmentRoundStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Decision must be SHORTLISTED or REJECTED."
            );
        }

        if (score != null
                && (score.compareTo(BigDecimal.ZERO) < 0
                || score.compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException(
                    "Score must be between 0 and 100."
            );
        }

        RecruitmentRound roundOne = recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(applicationId, 1)
                .orElseThrow(() -> new IllegalStateException(
                        "Round 1 does not exist."
                ));

        if (roundOne.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw new IllegalStateException(
                    "The candidate has not passed Round 1."
            );
        }

        RecruitmentRound roundTwo = recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(applicationId, 2)
                .orElseThrow(() -> new IllegalStateException(
                        "Start Round 2 before recording its decision."
                ));

        if (roundTwo.getStatus() == RecruitmentRoundStatus.REJECTED
                || roundTwo.getStatus() == RecruitmentRoundStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Round 2 has already been completed or rejected."
            );
        }

        roundTwo.setStatus(decision);
        roundTwo.setFeedback(feedback);
        roundTwo.setScore(score);
        roundTwo.setEvaluatedBy(companyUserId);
        roundTwo.setEvaluatedAt(LocalDateTime.now());

        RecruitmentRound savedRound =
                recruitmentRoundRepository.save(roundTwo);

        if (decision == RecruitmentRoundStatus.REJECTED) {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setStatusRemarks(feedback);
        } else {
            application.setStatus(ApplicationStatus.INTERVIEWED);
            application.setStatusRemarks(feedback);
        }

        jobApplicationRepository.save(application);

        return savedRound;
    }

    @Transactional(readOnly = true)
    public List<RecruitmentRound> getRounds(
            Long applicationId,
            Long companyUserId
    ) {
        CompanyProfile company = getApprovedCompany(companyUserId);

        JobApplication application = getApplication(applicationId);

        Job job = getJob(application.getJobId());

        verifyJobOwnership(job, company);

        return recruitmentRoundRepository
                .findByApplication_IdOrderByRoundNumberAsc(applicationId);
    }
}
