
package com.akash.placement.controller;

import com.akash.placement.dto.JobResponse;
import com.akash.placement.service.JobService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@PreAuthorize("hasRole('STUDENT')")
public class StudentJobController {

    private final JobService jobService;

    public StudentJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<JobResponse>> getEligibleJobs() {
        return ResponseEntity.ok(jobService.getEligibleJobs());
    }
}
