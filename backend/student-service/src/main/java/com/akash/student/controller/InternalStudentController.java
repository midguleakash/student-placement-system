package com.akash.student.controller;

import com.akash.student.dto.InternalStudentResponse;
import com.akash.student.model.StudentProfile;
import com.akash.student.repository.StudentProfileRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/internal/students")
public class InternalStudentController {

    private final StudentProfileRepository repository;
    private final String internalApiKey;

    public InternalStudentController(
            StudentProfileRepository repository,
            @Value("${internal.api-key}") String internalApiKey
    ) {
        this.repository = repository;
        this.internalApiKey = internalApiKey;
    }

    @GetMapping("/{userId}")
    public InternalStudentResponse getStudent(
            @PathVariable Long userId,
            @RequestHeader(
                    name = "X-Internal-API-Key",
                    required = false
            ) String suppliedKey
    ) {
        if (suppliedKey == null || !MessageDigest.isEqual(
                internalApiKey.getBytes(StandardCharsets.UTF_8),
                suppliedKey.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid internal API key"
            );
        }

        StudentProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found"
                ));

        String first = profile.getFirstName() == null
                ? ""
                : profile.getFirstName().trim();

        String last = profile.getLastName() == null
                ? ""
                : profile.getLastName().trim();

        String fullName = (first + " " + last).trim();

        if (fullName.isBlank()) {
            fullName = "Student #" + userId;
        }

        return new InternalStudentResponse(
                userId,
                profile.getFirstName(),
                profile.getLastName(),
                fullName
        );
    }
}