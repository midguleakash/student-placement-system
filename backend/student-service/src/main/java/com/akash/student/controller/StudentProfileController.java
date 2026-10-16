package com.akash.student.controller;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.dto.StudentProfileResponse;
import com.akash.student.enums.PlacementRegistrationStatus;
import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;
import com.akash.student.service.StudentProfileService;

import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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


    @PostMapping(
            value = "/resume",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<StudentProfileResponse> uploadResume(
            @RequestAttribute("userId") Long userId,
            @RequestParam("file") MultipartFile file) {

        StudentProfile profile = service.uploadResume(userId, file);

        return ResponseEntity.ok(
                StudentProfileResponse.from(profile));
    }


    @GetMapping(value = "/resume/view", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> viewMyResume(
            @RequestAttribute("userId") Long userId) {

        byte[] pdf = service.getMyResume(userId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"resume.pdf\""
                )
                .cacheControl(CacheControl.noStore())
                .body(pdf);
    }



    @GetMapping("/placement-registration")
    public ResponseEntity<StudentProfileResponse> getPlacementRegistration(
            @RequestAttribute("userId") Long userId) {

        StudentProfile profile = service.getMyProfile(userId);

        return ResponseEntity.ok(StudentProfileResponse.from(profile));
    }

    @PostMapping("/placement-registration/register")
    public ResponseEntity<StudentProfileResponse> registerForPlacement(
            @RequestAttribute("userId") Long userId) {

        StudentProfile profile = service.registerForPlacement(userId);

        return ResponseEntity.ok(StudentProfileResponse.from(profile));
    }

    @GetMapping("/placement-access")
    public ResponseEntity<Boolean> hasPlacementAccess(
            @RequestAttribute("userId") Long userId) {

        StudentProfile profile = service.getMyProfile(userId);

        boolean allowed =
                profile.getProfileStatus() == ProfileStatus.APPROVED
                        && profile.getPlacementRegistrationStatus()
                        == PlacementRegistrationStatus.APPROVED;

        return ResponseEntity.ok(allowed);
    }

}