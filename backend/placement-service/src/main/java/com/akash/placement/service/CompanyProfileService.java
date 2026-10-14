package com.akash.placement.service;

import com.akash.placement.dto.CompanyProfileRequest;
import com.akash.placement.dto.CompanyProfileResponse;
import com.akash.placement.dto.CompanyReviewRequest;

import java.util.List;

public interface CompanyProfileService {

    CompanyProfileResponse getMyProfile(Long userId);

    CompanyProfileResponse saveProfile(
            Long userId,
            String authenticatedEmail,
            CompanyProfileRequest request
    );

    CompanyProfileResponse submitProfile(Long userId);

    List<CompanyProfileResponse> getPendingCompanies();

    CompanyProfileResponse approveCompany(
            Long profileId,
            Long adminUserId
    );

    CompanyProfileResponse rejectCompany(
            Long profileId,
            Long adminUserId,
            CompanyReviewRequest request
    );
}