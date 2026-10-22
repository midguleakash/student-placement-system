
package com.akash.placement.controller;

import com.akash.placement.dto.CompanyApplicationResponse;
import com.akash.placement.dto.CompanyApplicationStatsResponse;
import com.akash.placement.enums.ApplicationStatus;
import com.akash.placement.service.CompanyApplicationService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/company/jobs/{jobId}/applications")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyJobApplicantsController {

    private final CompanyApplicationService companyApplicationService;

    public CompanyJobApplicantsController(
            CompanyApplicationService companyApplicationService
    ) {
        this.companyApplicationService = companyApplicationService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyApplicationResponse>> getApplications(
            HttpServletRequest request,
            @PathVariable Long jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate appliedFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate appliedTo
    ) {
        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                companyApplicationService.getJobApplications(
                        userId,
                        jobId,
                        status,
                        search,
                        appliedFrom,
                        appliedTo
                )
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<CompanyApplicationStatsResponse> getStats(
            HttpServletRequest request,
            @PathVariable Long jobId
    ) {
        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                companyApplicationService.getJobApplicationStats(
                        userId,
                        jobId
                )
        );
    }

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        Object rawUserId = request.getAttribute("userId");

        if (rawUserId == null) {
            throw new IllegalStateException(
                    "Authenticated user ID is missing from the request."
            );
        }

        try {
            return Long.valueOf(rawUserId.toString());
        } catch (NumberFormatException ex) {
            throw new IllegalStateException(
                    "Invalid authenticated user ID."
            );
        }
    }
}
