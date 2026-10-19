package com.akash.placement.controller;

import com.akash.placement.dto.ApplicationResponse;
import com.akash.placement.service.JobApplicationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/applications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApplicationController {

    private final JobApplicationService jobApplicationService;

    public AdminApplicationController(
            JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {

        return ResponseEntity.ok(
                jobApplicationService.getAllApplications()
        );
    }
}