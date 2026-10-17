
package com.akash.placement.service;

import com.akash.placement.dto.JobRequest;
import com.akash.placement.dto.JobResponse;
import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.enums.JobStatus;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.model.Job;
import com.akash.placement.repository.CompanyProfileRepository;
import com.akash.placement.repository.JobRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyProfileRepository companyRepository;

    public JobServiceImpl(
            JobRepository jobRepository,
            CompanyProfileRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    @Transactional
    public JobResponse createJob(Long companyUserId, JobRequest request) {
        CompanyProfile company = getApprovedCompany(companyUserId);
        validateDeadline(request.applicationDeadline());

        Job job = new Job();
        job.setCompanyId(company.getId());
        copyRequest(job, request);
        job.setStatus(JobStatus.DRAFT);
        job.setPublishedAt(null);

        return JobResponse.from(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse updateJob(
            Long jobId,
            Long companyUserId,
            JobRequest request) {

        Job job = getOwnedJob(jobId, companyUserId);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only draft jobs can be edited. Close a published job before creating a replacement."
            );
        }

        validateDeadline(request.applicationDeadline());
        copyRequest(job, request);

        return JobResponse.from(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse publishJob(Long jobId, Long companyUserId) {
        getApprovedCompany(companyUserId);
        Job job = getOwnedJob(jobId, companyUserId);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only draft jobs can be published."
            );
        }

        if (job.getApplicationDeadline() == null
                || !job.getApplicationDeadline().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException(
                    "The application deadline must be in the future."
            );
        }

        job.setStatus(JobStatus.PUBLISHED);
        job.setPublishedAt(LocalDateTime.now());

        return JobResponse.from(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse closeJob(Long jobId, Long companyUserId) {
        getApprovedCompany(companyUserId);
        Job job = getOwnedJob(jobId, companyUserId);

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Only published jobs can be closed."
            );
        }

        job.setStatus(JobStatus.CLOSED);

        return JobResponse.from(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(Long companyUserId) {
        CompanyProfile company = getApprovedCompany(companyUserId);

        return jobRepository
                .findByCompanyIdOrderByCreatedAtDesc(company.getId())
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobForCompany(
            Long jobId,
            Long companyUserId) {

        getApprovedCompany(companyUserId);
        return JobResponse.from(getOwnedJob(jobId, companyUserId));
    }

    private CompanyProfile getApprovedCompany(Long userId) {
        CompanyProfile company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Complete your company profile first."
                ));

        if (company.getProfileStatus() != CompanyProfileStatus.APPROVED) {
            throw new AccessDeniedException(
                    "Your company must be approved before managing jobs."
            );
        }

        return company;
    }

    private Job getOwnedJob(Long jobId, Long companyUserId) {
        CompanyProfile company = companyRepository.findByUserId(companyUserId)
                .orElseThrow(() -> new IllegalStateException(
                        "Company profile not found."
                ));

        return jobRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new AccessDeniedException(
                        "Job not found or you do not own this job."
                ));
    }

    private void validateDeadline(LocalDateTime deadline) {
        if (deadline == null || !deadline.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Application deadline must be in the future."
            );
        }
    }

    private void copyRequest(Job job, JobRequest request) {
        job.setTitle(request.title().trim());
        job.setDescription(request.description().trim());
        job.setRequiredSkills(request.requiredSkills().trim());
        job.setMinimumCgpa(request.minimumCgpa());
        job.setMaximumActiveBacklogs(request.maximumActiveBacklogs());
        job.setEligibleGraduationYears(request.eligibleGraduationYears());
        job.setSalary(request.salary());
        job.setLocation(request.location());
        job.setWorkMode(request.workMode());
        job.setVacancies(request.vacancies());
        job.setApplicationDeadline(request.applicationDeadline());
    }


    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getEligibleJobs() {
        return jobRepository
                .findByStatusAndApplicationDeadlineAfterOrderByPublishedAtDesc(
                        JobStatus.PUBLISHED,
                        LocalDateTime.now()
                )
                .stream()
                .map(JobResponse::from)
                .toList();
    }

}
