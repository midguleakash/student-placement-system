package com.akash.student.controller;

import com.akash.student.dto.ProfileReviewRequest;
import com.akash.student.dto.StudentProfileResponse;
import com.akash.student.model.StudentProfile;
import com.akash.student.service.StudentProfileService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final StudentProfileService service;

    public AdminStudentController(StudentProfileService service) {
        this.service = service;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<StudentProfileResponse>> getPendingProfiles() {

        List<StudentProfileResponse> profiles =
                service.getPendingProfiles()
                        .stream()
                        .map(StudentProfileResponse::from)
                        .toList();

        return ResponseEntity.ok(profiles);
    }

    @PostMapping("/{profileId}/approve")
    public ResponseEntity<StudentProfileResponse> approveProfile(
            @PathVariable Long profileId) {

        StudentProfile profile =
                service.approveProfile(profileId);

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }

    @PostMapping("/{profileId}/reject")
    public ResponseEntity<StudentProfileResponse> rejectProfile(
            @PathVariable Long profileId,
            @Valid @RequestBody ProfileReviewRequest request) {

        StudentProfile profile =
                service.rejectProfile(
                        profileId,
                        request.getRemarks());

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }
}