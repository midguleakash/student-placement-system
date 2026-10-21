
package com.akash.placement.service;

import com.akash.placement.dto.CompanyApplicationResponse;
import com.akash.placement.dto.CompanyApplicationStatsResponse;
import com.akash.placement.enums.ApplicationStatus;

import java.time.LocalDate;
import java.util.List;

public interface CompanyApplicationService {

    List<CompanyApplicationResponse> getCompanyApplications(
            Long userId,
            Long jobId,
            ApplicationStatus status,
            String search,
            LocalDate appliedFrom,
            LocalDate appliedTo
    );

    List<CompanyApplicationResponse> getJobApplications(
            Long userId,
            Long jobId,
            ApplicationStatus status,
            String search,
            LocalDate appliedFrom,
            LocalDate appliedTo
    );

    CompanyApplicationStatsResponse getCompanyApplicationStats(Long userId);

    CompanyApplicationStatsResponse getJobApplicationStats(
            Long userId,
            Long jobId
    );
}
