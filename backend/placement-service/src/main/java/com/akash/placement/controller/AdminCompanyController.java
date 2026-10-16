
package com.akash.placement.controller;

import com.akash.placement.dto.CompanyReviewRequest;
import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.model.CompanyProfile;
import com.akash.placement.repository.CompanyProfileRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompanyController {

    private final CompanyProfileRepository repository;

    public AdminCompanyController(CompanyProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<CompanyAdminResponse>> getAllCompanies() {
        List<CompanyAdminResponse> companies = repository.findAll()
                .stream()
                .map(CompanyAdminResponse::from)
                .toList();

        return ResponseEntity.ok(companies);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CompanyAdminResponse>> getPendingCompanies() {
        List<CompanyAdminResponse> companies =
                repository.findByProfileStatus(
                                CompanyProfileStatus.PENDING)
                        .stream()
                        .map(CompanyAdminResponse::from)
                        .toList();

        return ResponseEntity.ok(companies);
    }

    @GetMapping("/stats")
    public ResponseEntity<CompanyStats> getCompanyStats() {
        return ResponseEntity.ok(new CompanyStats(
                repository.count(),
                repository.countByProfileStatus(
                        CompanyProfileStatus.PENDING),
                repository.countByProfileStatus(
                        CompanyProfileStatus.APPROVED),
                repository.countByProfileStatus(
                        CompanyProfileStatus.REJECTED)
        ));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<CompanyAdminResponse> approveCompany(
            @PathVariable Long id) {

        CompanyProfile profile = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Company profile not found"));

        if (profile.getProfileStatus() != CompanyProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending company profiles can be approved");
        }

        profile.setProfileStatus(CompanyProfileStatus.APPROVED);
        profile.setRejectionRemarks(null);
        profile.setReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(
                CompanyAdminResponse.from(repository.save(profile)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<CompanyAdminResponse> rejectCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyReviewRequest request) {

        CompanyProfile profile = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Company profile not found"));

        if (profile.getProfileStatus() != CompanyProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending company profiles can be rejected");
        }

        profile.setProfileStatus(CompanyProfileStatus.REJECTED);
        profile.setRejectionRemarks(request.remarks().trim());
        profile.setReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(
                CompanyAdminResponse.from(repository.save(profile)));
    }

    public record CompanyAdminResponse(
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
            LocalDateTime createdAt
    ) {
        public static CompanyAdminResponse from(CompanyProfile profile) {
            return new CompanyAdminResponse(
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
                    profile.getCreatedAt()
            );
        }
    }

    public record CompanyStats(
            long totalCompanies,
            long pendingCompanies,
            long approvedCompanies,
            long rejectedCompanies
    ) {
    }
}
