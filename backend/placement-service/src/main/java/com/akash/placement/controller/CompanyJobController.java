
package com.akash.placement.controller;

import com.akash.placement.dto.JobRequest;
import com.akash.placement.dto.JobResponse;
import com.akash.placement.service.JobService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/jobs")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyJobController {

    private final JobService jobService;

    public CompanyJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            HttpServletRequest request,
            @Valid @RequestBody JobRequest body) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobService.createJob(userId, body));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getMyJobs(
            HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(jobService.getMyJobs(userId));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getMyJob(
            HttpServletRequest request,
            @PathVariable Long jobId) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                jobService.getJobForCompany(jobId, userId)
        );
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(
            HttpServletRequest request,
            @PathVariable Long jobId,
            @Valid @RequestBody JobRequest body) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                jobService.updateJob(jobId, userId, body)
        );
    }

    @PatchMapping("/{jobId}/publish")
    public ResponseEntity<JobResponse> publishJob(
            HttpServletRequest request,
            @PathVariable Long jobId) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                jobService.publishJob(jobId, userId)
        );
    }

    @PatchMapping("/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(
            HttpServletRequest request,
            @PathVariable Long jobId) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
                jobService.closeJob(jobId, userId)
        );
    }
}
