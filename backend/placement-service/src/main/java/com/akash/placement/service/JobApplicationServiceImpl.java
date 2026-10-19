
package com.akash.placement.service;

import com.akash.placement.dto.ApplicationResponse;
import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.enums.JobStatus;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.model.Job;
import com.akash.placement.model.JobApplication;
import com.akash.placement.repository.JobApplicationRepository;
import com.akash.placement.repository.JobRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.akash.placement.repository.CompanyProfileRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobApplicationServiceImpl
        implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CompanyProfileRepository companyProfileRepository;

    public JobApplicationServiceImpl(
            JobApplicationRepository applicationRepository,
            JobRepository jobRepository, CompanyProfileRepository companyProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.companyProfileRepository = companyProfileRepository;
    }

    @Override
    @Transactional
    public ApplicationResponse applyForJob(
            Long jobId,
            Long studentUserId) {

        // 1. Validate job existence
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Job not found."
                ));

        // 2. Validate job status
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You can apply only for published jobs."
            );
        }

        // 3. Validate application deadline
        if (job.getApplicationDeadline() == null
                || !job.getApplicationDeadline()
                .isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The application deadline has passed."
            );
        }

        // 4. Prevent duplicate applications
        if (applicationRepository.existsByJobIdAndStudentUserId(
                jobId, studentUserId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already applied for this job."
            );
        }

        // 5. Create application
        JobApplication application = new JobApplication();
        application.setJobId(jobId);
        application.setStudentUserId(studentUserId);
        application.setStatus(ApplicationStatus.APPLIED);

        try {
            // 6. Save application
            JobApplication saved =
                    applicationRepository.saveAndFlush(application);

            // 7. Retrieve company name using company profile ID
            String companyName = companyProfileRepository
                    .findById(job.getCompanyId())
                    .map(CompanyProfile::getCompanyName)
                    .filter(name -> name != null && !name.isBlank())
                    .orElse("Company name unavailable");

            // 8. Return successful application response
            return ApplicationResponse.from(
                    saved,
                    job.getTitle(),
                    companyName
            );

        } catch (DataIntegrityViolationException ex) {

            // Handle duplicate application constraint violations
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already applied for this job.",
                    ex
            );
        }
    }
    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(
            Long studentUserId) {

        return applicationRepository
                .findByStudentUserIdOrderByAppliedAtDesc(studentUserId)
                .stream()
                .map(application -> {
                    Job job = jobRepository.findById(
                            application.getJobId()
                    ).orElse(null);

                    String title = job != null
                            ? job.getTitle()
                            : "Job no longer available";

                    String companyName = "Company not available";

                    if (job != null) {
                        companyName = companyProfileRepository
                                .findById(job.getCompanyId())
                                .map(CompanyProfile::getCompanyName)
                                .filter(name -> name != null && !name.isBlank())
                                .orElse("Company name unavailable");
                    }

                    return ApplicationResponse.from(
                            application,
                            title,
                            companyName
                    );
                })
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications() {

        return applicationRepository
                .findAllByOrderByAppliedAtDesc()
                .stream()
                .map(application -> {

                    Job job = jobRepository.findById(
                            application.getJobId()
                    ).orElse(null);

                    String jobTitle = job != null
                            ? job.getTitle()
                            : "Job no longer available";

                    String companyName = "Company name unavailable";

                    if (job != null) {
                        companyName = companyProfileRepository
                                .findById(job.getCompanyId())
                                .map(CompanyProfile::getCompanyName)
                                .filter(name ->
                                        name != null && !name.isBlank()
                                )
                                .orElse("Company name unavailable");
                    }

                    return ApplicationResponse.from(
                            application,
                            jobTitle,
                            companyName
                    );
                })
                .toList();
    }

}
