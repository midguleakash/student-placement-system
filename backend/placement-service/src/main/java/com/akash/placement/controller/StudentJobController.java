
package com.akash.placement.controller;

import com.akash.placement.dto.JobResponse;
import com.akash.placement.service.JobService;
import com.akash.placement.service.StudentPlacementAccessService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@PreAuthorize("hasRole('STUDENT')")
public class StudentJobController {

    private final JobService jobService;
    private final StudentPlacementAccessService placementAccessService;

    public StudentJobController(
            JobService jobService,
            StudentPlacementAccessService placementAccessService) {
        this.jobService = jobService;
        this.placementAccessService = placementAccessService;
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<JobResponse>> getEligibleJobs(
            @RequestAttribute("userId") Long userId,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {

        boolean allowed =
                placementAccessService.hasPlacementAccess(authorization);

        if (!allowed) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(jobService.getEligibleJobs());
    }
}
