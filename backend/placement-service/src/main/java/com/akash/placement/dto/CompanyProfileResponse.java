package com.akash.placement.dto;

import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.model.CompanyProfile;

import java.time.LocalDateTime;

public record CompanyProfileResponse(
        Long id,
        Long userId,
        String companyName,
        String industry,
        String website,
        String contactPerson,
        String phone,
        String companyEmail,
        String address,
        String description,
        CompanyProfileStatus profileStatus,
        String rejectionRemarks,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CompanyProfileResponse from(CompanyProfile profile) {
        return new CompanyProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getCompanyName(),
                profile.getIndustry(),
                profile.getWebsite(),
                profile.getContactPerson(),
                profile.getPhone(),
                profile.getCompanyEmail(),
                profile.getAddress(),
                profile.getDescription(),
                profile.getProfileStatus(),
                profile.getRejectionRemarks(),
                profile.getSubmittedAt(),
                profile.getReviewedAt(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}