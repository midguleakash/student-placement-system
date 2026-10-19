
package com.akash.placement.controller;

import com.akash.placement.dto.ApplicationResponse;
import com.akash.placement.service.JobApplicationService;
import com.akash.placement.service.StudentPlacementAccessService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@PreAuthorize("hasRole('STUDENT')")
public class StudentApplicationController {

    private final JobApplicationService applicationService;
    private final StudentPlacementAccessService accessService;

    public StudentApplicationController(
            JobApplicationService applicationService,
            StudentPlacementAccessService accessService) {
        this.applicationService = applicationService;
        this.accessService = accessService;
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable Long jobId,
            @RequestAttribute("userId") Long studentUserId,
            @RequestHeader(
                    value = HttpHeaders.AUTHORIZATION,
                    required = false
            ) String authorizationHeader) {

        boolean allowed =
                accessService.hasPlacementAccess(authorizationHeader);

        if (!allowed) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your profile and placement registration must be approved before applying."
            );
        }

        ApplicationResponse response =
                applicationService.applyForJob(jobId, studentUserId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/me")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestAttribute("userId") Long studentUserId) {

        return ResponseEntity.ok(
                applicationService.getMyApplications(studentUserId)
        );
    }
}
