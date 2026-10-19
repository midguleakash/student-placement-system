
package com.akash.placement.service;

import com.akash.placement.dto.CompanyApplicationResponse;
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
}
