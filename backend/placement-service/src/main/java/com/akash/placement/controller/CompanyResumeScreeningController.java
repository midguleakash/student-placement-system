
package com.akash.placement.controller;

import com.akash.placement.dto.ResumeScreeningResult;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.model.Job;
import com.akash.placement.model.JobApplication;
import com.akash.placement.repository.CompanyProfileRepository;
import com.akash.placement.repository.JobApplicationRepository;
import com.akash.placement.repository.JobRepository;
import com.akash.placement.service.ResumeScreeningService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/company/applications")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyResumeScreeningController {

    private final CompanyProfileRepository companyProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final ResumeScreeningService resumeScreeningService;

    public CompanyResumeScreeningController(
            CompanyProfileRepository companyProfileRepository,
            JobApplicationRepository jobApplicationRepository,
            JobRepository jobRepository,
            ResumeScreeningService resumeScreeningService) {

        this.companyProfileRepository = companyProfileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
        this.resumeScreeningService = resumeScreeningService;
    }

    @GetMapping("/{applicationId}/screening")
    public ResponseEntity<ResumeScreeningResult> screenApplication(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        // Get the authenticated company's user ID from the JWT filter.
        Object rawUserId = request.getAttribute("userId");

        if (rawUserId == null) {
            throw new ResponseStatusException(
                    UNAUTHORIZED,
                    "Authenticated user ID is missing."
            );
        }

        Long userId;

        try {
            userId = Long.valueOf(rawUserId.toString());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(
                    UNAUTHORIZED,
                    "Invalid authenticated user ID."
            );
        }

        // Find the company profile belonging to this logged-in user.
        CompanyProfile company = companyProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        FORBIDDEN,
                        "Company profile not found."
                ));

        // Only approved companies can screen applications.
        if (company.getProfileStatus() == null
                || !"APPROVED".equals(
                company.getProfileStatus().toString())) {

            throw new ResponseStatusException(
                    FORBIDDEN,
                    "Company profile must be approved."
            );
        }

        // Find the application.
        JobApplication application = jobApplicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "Application not found."
                ));

        // Find the job associated with the application.
        Job job = jobRepository
                .findById(application.getJobId())
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "Job associated with this application was not found."
                ));

        // IMPORTANT: job.companyId is the CompanyProfile ID,
        // not the authenticated user's ID.
        if (!company.getId().equals(job.getCompanyId())) {
            throw new ResponseStatusException(
                    FORBIDDEN,
                    "You cannot screen applications for another company's job."
            );
        }

        // Evaluate student eligibility and resume skills.
        ResumeScreeningResult result = resumeScreeningService.evaluate(
                job,
                application.getStudentUserId()
        );

        return ResponseEntity.ok(result);
    }
}
