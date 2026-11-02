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
    private static final int ROUND_TWO = 2;
    private static final int ROUND_THREE = 3;

    private static final String ROUND_ONE_NAME = "Resume Screening";
    private static final String ROUND_TWO_NAME = "Technical Interview";
    private static final String ROUND_THREE_NAME = "HR Interview";

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

    // -------------------- ROUND 1 --------------------

    @Transactional
    public RecruitmentRound createRoundOne(
            Long applicationId,
            Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);

        ensureApplicationOpen(application);

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId, ROUND_ONE)
                .orElseGet(() ->
                        recruitmentRoundRepository.save(
                                new RecruitmentRound(
                                        application,
                                        ROUND_ONE,
                                        ROUND_ONE_NAME
                                )
                        ));
    }

    @Transactional
    public RecruitmentRound decideRoundOne(
            Long applicationId,
            Long companyUserId,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);
        ensureApplicationOpen(application);

        RecruitmentRound round = getOrCreateRoundOne(application);

        ensureRoundNotEvaluated(round);
        validateDecision(decision, score, ROUND_ONE);

        saveEvaluation(round, decision, feedback, score, companyUserId);

        application.setStatus(
                decision == RecruitmentRoundStatus.SHORTLISTED
                        ? ApplicationStatus.SHORTLISTED
                        : ApplicationStatus.REJECTED
        );
        application.setStatusRemarks(feedback);
        jobApplicationRepository.save(application);

        return round;
    }

    // -------------------- ROUND 2 --------------------

    @Transactional
    public RecruitmentRound createRoundTwo(
            Long applicationId,
            Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);
        ensureApplicationOpen(application);

        RecruitmentRound roundOne = getRequiredRound(applicationId, ROUND_ONE);

        if (roundOne.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw conflict("Candidate must pass Round 1 before Round 2.");
        }

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId, ROUND_TWO)
                .orElseGet(() ->
                        recruitmentRoundRepository.save(
                                new RecruitmentRound(
                                        application,
                                        ROUND_TWO,
                                        ROUND_TWO_NAME
                                )
                        ));
    }

    @Transactional
    public RecruitmentRound decideRoundTwo(
            Long applicationId,
            Long companyUserId,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);
        ensureApplicationOpen(application);

        RecruitmentRound roundOne = getRequiredRound(applicationId, ROUND_ONE);

        if (roundOne.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw conflict("Candidate has not passed Round 1.");
        }

        RecruitmentRound roundTwo = getRequiredRound(applicationId, ROUND_TWO);

        ensureRoundNotEvaluated(roundTwo);
        validateDecision(decision, score, ROUND_TWO);

        saveEvaluation(roundTwo, decision, feedback, score, companyUserId);

        application.setStatus(
                decision == RecruitmentRoundStatus.SHORTLISTED
                        ? ApplicationStatus.INTERVIEWED
                        : ApplicationStatus.REJECTED
        );
        application.setStatusRemarks(feedback);
        jobApplicationRepository.save(application);

        return roundTwo;
    }

    // -------------------- ROUND 3 --------------------

    @Transactional
    public RecruitmentRound createRoundThree(
            Long applicationId,
            Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);
        ensureApplicationOpen(application);

        RecruitmentRound roundTwo = getRequiredRound(applicationId, ROUND_TWO);

        if (roundTwo.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw conflict("Candidate must pass Round 2 before Round 3.");
        }

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId, ROUND_THREE)
                .orElseGet(() ->
                        recruitmentRoundRepository.save(
                                new RecruitmentRound(
                                        application,
                                        ROUND_THREE,
                                        ROUND_THREE_NAME
                                )
                        ));
    }

    @Transactional
    public RecruitmentRound decideRoundThree(
            Long applicationId,
            Long companyUserId,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);
        ensureApplicationOpen(application);

        RecruitmentRound roundTwo = getRequiredRound(applicationId, ROUND_TWO);

        if (roundTwo.getStatus() != RecruitmentRoundStatus.SHORTLISTED) {
            throw conflict("Candidate has not passed Round 2.");
        }

        RecruitmentRound roundThree =
                getRequiredRound(applicationId, ROUND_THREE);

        ensureRoundNotEvaluated(roundThree);
        validateDecision(decision, score, ROUND_THREE);

        saveEvaluation(
                roundThree, decision, feedback, score, companyUserId);

        application.setStatus(
                decision == RecruitmentRoundStatus.SHORTLISTED
                        ? ApplicationStatus.SELECTED
                        : ApplicationStatus.REJECTED
        );
        application.setStatusRemarks(feedback);
        jobApplicationRepository.save(application);

        return roundThree;
    }

    // -------------------- ROUND HISTORY --------------------

    @Transactional(readOnly = true)
    public List<RecruitmentRound> getRounds(
            Long applicationId,
            Long companyUserId) {

        CompanyProfile company = getApprovedCompany(companyUserId);
        JobApplication application = getApplication(applicationId);
        verifyOwnership(application, company);

        return recruitmentRoundRepository
                .findByApplication_IdOrderByRoundNumberAsc(applicationId);
    }

    // -------------------- SHARED HELPERS --------------------

    private RecruitmentRound getOrCreateRoundOne(
            JobApplication application) {

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        application.getId(), ROUND_ONE)
                .orElseGet(() ->
                        new RecruitmentRound(
                                application,
                                ROUND_ONE,
                                ROUND_ONE_NAME
                        ));
    }

    private RecruitmentRound getRequiredRound(
            Long applicationId,
            int roundNumber) {

        return recruitmentRoundRepository
                .findByApplication_IdAndRoundNumber(
                        applicationId, roundNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Start Round " + roundNumber
                                + " before recording its decision."
                ));
    }

    private void ensureApplicationOpen(JobApplication application) {
        ApplicationStatus status = application.getStatus();

        if (status == ApplicationStatus.REJECTED
                || status == ApplicationStatus.SELECTED
                || status == ApplicationStatus.HIRED) {
            throw conflict("This application is closed and cannot proceed.");
        }
    }

    private void ensureRoundNotEvaluated(RecruitmentRound round) {
        if (round.getStatus() == RecruitmentRoundStatus.SHORTLISTED
                || round.getStatus() == RecruitmentRoundStatus.REJECTED
                || round.getStatus() == RecruitmentRoundStatus.COMPLETED) {
            throw conflict("This round has already been evaluated.");
        }
    }

    private void validateDecision(
            RecruitmentRoundStatus decision,
            BigDecimal score,
            int roundNumber) {

        if (decision != RecruitmentRoundStatus.SHORTLISTED
                && decision != RecruitmentRoundStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Round " + roundNumber
                            + " decision must be SHORTLISTED or REJECTED."
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
    }

    private void saveEvaluation(
            RecruitmentRound round,
            RecruitmentRoundStatus decision,
            String feedback,
            BigDecimal score,
            Long companyUserId) {

        round.setStatus(decision);
        round.setFeedback(feedback);
        round.setScore(score);
        round.setEvaluatedBy(companyUserId);
        round.setEvaluatedAt(LocalDateTime.now());

        recruitmentRoundRepository.save(round);
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

    private void verifyOwnership(
            JobApplication application,
            CompanyProfile company) {

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found."
                ));

        if (!company.getId().equals(job.getCompanyId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot manage another company's application."
            );
        }
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}