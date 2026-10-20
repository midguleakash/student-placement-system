
package com.akash.student.controller;

import com.akash.student.dto.StudentScreeningResponse;
import com.akash.student.model.StudentProfile;
import com.akash.student.repository.StudentProfileRepository;
import com.akash.student.service.StudentProfileService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/internal/students")
public class InternalStudentScreeningController {

    private final StudentProfileRepository repository;
    private final StudentProfileService studentProfileService;
    private final String internalApiKey;

    public InternalStudentScreeningController(
            StudentProfileRepository repository,
            StudentProfileService studentProfileService,
            @Value("${internal.api-key}") String internalApiKey) {

        this.repository = repository;
        this.studentProfileService = studentProfileService;
        this.internalApiKey = internalApiKey;
    }

    private boolean isAuthorized(String suppliedKey) {
        if (internalApiKey == null || internalApiKey.isBlank()
                || suppliedKey == null || suppliedKey.isBlank()) {
            return false;
        }

        return MessageDigest.isEqual(
                internalApiKey.getBytes(StandardCharsets.UTF_8),
                suppliedKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    @GetMapping("/{userId}/screening")
    public ResponseEntity<?> getScreeningData(
            @PathVariable Long userId,
            @RequestHeader(
                    value = "X-Internal-API-Key",
                    required = false
            ) String suppliedKey) {

        if (!isAuthorized(suppliedKey)) {
            return ResponseEntity.status(403)
                    .body("Internal service authentication failed.");
        }

        return repository.findByUserId(userId)
                .<ResponseEntity<?>>map(profile -> {
                    StudentScreeningResponse response =
                            new StudentScreeningResponse(
                                    profile.getUserId(),
                                    profile.getFirstName(),
                                    profile.getLastName(),
                                    profile.getBranch(),
                                    profile.getGraduationYear(),
                                    profile.getCgpa(),
                                    profile.getActiveBacklogs(),
                                    profile.getSkills(),
                                    profile.getProfileStatus(),
                                    profile.getPlacementRegistrationStatus(),
                                    profile.getResumePublicId() != null
                                            && !profile.getResumePublicId()
                                            .isBlank()
                            );

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/resume")
    public ResponseEntity<?> getStudentResume(
            @PathVariable Long userId,
            @RequestHeader(
                    value = "X-Internal-API-Key",
                    required = false
            ) String suppliedKey) {

        if (!isAuthorized(suppliedKey)) {
            return ResponseEntity.status(403)
                    .body("Internal service authentication failed.");
        }

        try {
            byte[] pdf = studentProfileService.getMyResume(userId);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .cacheControl(CacheControl.noStore())
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"resume.pdf\""
                    )
                    .body(pdf);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
