
package com.akash.placement.controller;

import com.akash.placement.dto.CompanyProfileRequest;
import com.akash.placement.dto.CompanyProfileResponse;
import com.akash.placement.service.CompanyProfileService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company/profile")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyProfileController {

    private final CompanyProfileService service;

    public CompanyProfileController(CompanyProfileService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public ResponseEntity<CompanyProfileResponse> getMyProfile(
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(service.getMyProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<CompanyProfileResponse> saveProfile(
            HttpServletRequest request,
            @Valid @RequestBody CompanyProfileRequest body
    ) {
        Long userId = (Long) request.getAttribute("userId");
        String email = (String) request.getAttribute("email");

        return ResponseEntity.ok(
                service.saveProfile(userId, email, body)
        );
    }

    @PostMapping("/submit")
    public ResponseEntity<CompanyProfileResponse> submitProfile(
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(service.submitProfile(userId));
    }
}
