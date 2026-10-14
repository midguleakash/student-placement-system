
package com.akash.placement.service;

import com.akash.placement.dto.CompanyProfileRequest;
import com.akash.placement.dto.CompanyProfileResponse;
import com.akash.placement.dto.CompanyReviewRequest;
import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.repository.CompanyProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompanyProfileServiceImpl implements CompanyProfileService {

    private final CompanyProfileRepository repository;

    public CompanyProfileServiceImpl(
            CompanyProfileRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public CompanyProfileResponse getMyProfile(Long userId) {

        CompanyProfile profile = repository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile created = new CompanyProfile();
                    created.setUserId(userId);
                    created.setProfileStatus(
                            CompanyProfileStatus.INCOMPLETE
                    );

                    return repository.save(created);
                });

        return CompanyProfileResponse.from(profile);
    }

    @Override
    @Transactional
    public CompanyProfileResponse saveProfile(
            Long userId,
            String authenticatedEmail,
            CompanyProfileRequest request
    ) {

        CompanyProfile profile = repository.findByUserId(userId)
                .orElseGet(() -> {
                    CompanyProfile created = new CompanyProfile();
                    created.setUserId(userId);
                    return created;
                });

        CompanyProfileStatus status = profile.getProfileStatus();

        if (status == CompanyProfileStatus.PENDING
                || status == CompanyProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Profile cannot be edited while pending or after approval."
            );
        }

        profile.setCompanyName(request.companyName().trim());
        profile.setIndustry(request.industry().trim());
        profile.setWebsite(blankToNull(request.website()));
        profile.setContactPerson(request.contactPerson().trim());
        profile.setPhone(request.phone().trim());

        // Use the email associated with the authenticated JWT.
        profile.setCompanyEmail(authenticatedEmail);

        profile.setAddress(request.address().trim());
        profile.setDescription(request.description().trim());

        // A rejected company can correct its profile and resubmit.
        profile.setRejectionRemarks(null);

        return CompanyProfileResponse.from(repository.save(profile));
    }

    @Override
    @Transactional
    public CompanyProfileResponse submitProfile(Long userId) {

        CompanyProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Save your company profile before submitting."
                ));

        if (profile.getProfileStatus() == CompanyProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Your profile is already pending approval."
            );
        }

        if (profile.getProfileStatus() == CompanyProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Your company profile is already approved."
            );
        }

        validateCompleteProfile(profile);

        profile.setProfileStatus(CompanyProfileStatus.PENDING);
        profile.setSubmittedAt(LocalDateTime.now());
        profile.setReviewedAt(null);
        profile.setReviewedBy(null);
        profile.setRejectionRemarks(null);

        return CompanyProfileResponse.from(repository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyProfileResponse> getPendingCompanies() {

        return repository
                .findByProfileStatusOrderBySubmittedAtAsc(
                        CompanyProfileStatus.PENDING
                )
                .stream()
                .map(CompanyProfileResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CompanyProfileResponse approveCompany(
            Long profileId,
            Long adminUserId
    ) {

        CompanyProfile profile = getPendingProfile(profileId);

        profile.setProfileStatus(CompanyProfileStatus.APPROVED);
        profile.setReviewedAt(LocalDateTime.now());
        profile.setReviewedBy(adminUserId);
        profile.setRejectionRemarks(null);

        return CompanyProfileResponse.from(repository.save(profile));
    }

    @Override
    @Transactional
    public CompanyProfileResponse rejectCompany(
            Long profileId,
            Long adminUserId,
            CompanyReviewRequest request
    ) {

        CompanyProfile profile = getPendingProfile(profileId);

        profile.setProfileStatus(CompanyProfileStatus.REJECTED);
        profile.setReviewedAt(LocalDateTime.now());
        profile.setReviewedBy(adminUserId);
        profile.setRejectionRemarks(request.remarks().trim());

        return CompanyProfileResponse.from(repository.save(profile));
    }

    private CompanyProfile getPendingProfile(Long profileId) {

        CompanyProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Company profile not found."
                ));

        if (profile.getProfileStatus() != CompanyProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending company profiles can be reviewed."
            );
        }

        return profile;
    }

    private void validateCompleteProfile(CompanyProfile profile) {

        if (isBlank(profile.getCompanyName())
                || isBlank(profile.getIndustry())
                || isBlank(profile.getContactPerson())
                || isBlank(profile.getPhone())
                || isBlank(profile.getCompanyEmail())
                || isBlank(profile.getAddress())
                || isBlank(profile.getDescription())) {

            throw new IllegalStateException(
                    "Complete all required company profile fields before submitting."
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }
}
