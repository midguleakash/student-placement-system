
package com.akash.placement.service;

import com.akash.placement.dto.JobRequest;
import com.akash.placement.dto.JobResponse;

import java.util.List;

public interface JobService {

    JobResponse createJob(Long companyUserId, JobRequest request);

    JobResponse updateJob(
            Long jobId,
            Long companyUserId,
            JobRequest request
    );

    JobResponse publishJob(Long jobId, Long companyUserId);

    JobResponse closeJob(Long jobId, Long companyUserId);

    List<JobResponse> getMyJobs(Long companyUserId);

    List<JobResponse> getAllJobs();

    JobResponse getJobForCompany(Long jobId, Long companyUserId);

    List<JobResponse> getEligibleJobs();
}
