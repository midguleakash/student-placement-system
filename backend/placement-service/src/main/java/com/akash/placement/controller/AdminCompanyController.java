
package com.akash.placement.controller;

import com.akash.placement.dto.CompanyProfileResponse;
import com.akash.placement.dto.CompanyReviewRequest;
import com.akash.placement.service.CompanyProfileService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompanyController {

    private final CompanyProfileService service;

    public AdminCompanyController(CompanyProfileService service) {
        this.service = service;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CompanyProfileResponse>> getPendingCompanies() {
        return ResponseEntity.ok(service.getPendingCompanies());
    }

    @PostMapping("/{profileId}/approve")
    public ResponseEntity<CompanyProfileResponse> approveCompany(
            @PathVariable Long profileId,
            HttpServletRequest request
    ) {
        Long adminUserId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                service.approveCompany(profileId, adminUserId)
        );
    }

    @PostMapping("/{profileId}/reject")
    public ResponseEntity<CompanyProfileResponse> rejectCompany(
            @PathVariable Long profileId,
            @Valid @RequestBody CompanyReviewRequest body,
            HttpServletRequest request
    ) {
        Long adminUserId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                service.rejectCompany(profileId, adminUserId, body)
        );
    }
}
