
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
@RequestMapping("/api/company/applications")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyApplicationController {

    private final CompanyApplicationService companyApplicationService;

    public CompanyApplicationController(
            CompanyApplicationService companyApplicationService
    ) {
        this.companyApplicationService = companyApplicationService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyApplicationResponse>> getApplications(
            HttpServletRequest request,

            @RequestParam(required = false)
            Long jobId,

            @RequestParam(required = false)
            ApplicationStatus status,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate appliedFrom,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate appliedTo
    ) {
        // JwtAuthenticationFilter stores the numeric user ID here.
        Object rawUserId = request.getAttribute("userId");

        if (rawUserId == null) {
            throw new IllegalStateException(
                    "Authenticated user ID is missing from the request."
            );
        }

        Long userId;

        try {
            userId = Long.valueOf(rawUserId.toString());
        } catch (NumberFormatException ex) {
            throw new IllegalStateException(
                    "Invalid authenticated user ID."
            );
        }

        List<CompanyApplicationResponse> applications =
                companyApplicationService.getCompanyApplications(
                        userId,
                        jobId,
                        status,
                        search,
                        appliedFrom,
                        appliedTo
                );

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/stats")
    public ResponseEntity<CompanyApplicationStatsResponse> getCompanyStats(
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                companyApplicationService.getCompanyApplicationStats(userId)
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
