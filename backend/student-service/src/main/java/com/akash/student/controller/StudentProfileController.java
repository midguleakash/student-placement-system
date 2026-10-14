package com.akash.student.controller;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.dto.StudentProfileResponse;
import com.akash.student.model.StudentProfile;
import com.akash.student.service.StudentProfileService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/profile")
@PreAuthorize("hasRole('STUDENT')")
public class StudentProfileController {

    private final StudentProfileService service;

    public StudentProfileController(StudentProfileService service) {
        this.service = service;
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfileResponse> saveProfile(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody StudentProfileRequest request) {

        StudentProfile profile =
                service.saveProfile(userId, request);

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }

    @PostMapping("/submit")
    public ResponseEntity<StudentProfileResponse> submitProfile(
            @RequestAttribute("userId") Long userId) {

        StudentProfile profile =
                service.submitProfile(userId);

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getMyProfile(
            @RequestAttribute("userId") Long userId) {

        StudentProfile profile =
                service.getMyProfile(userId);

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }
}