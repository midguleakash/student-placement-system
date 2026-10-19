
package com.akash.placement.service;

import com.akash.placement.dto.ApplicationResponse;

import java.util.List;

public interface JobApplicationService {

    ApplicationResponse applyForJob(Long jobId, Long studentUserId);

    List<ApplicationResponse> getMyApplications(Long studentUserId);

    List<ApplicationResponse> getAllApplications();
}
