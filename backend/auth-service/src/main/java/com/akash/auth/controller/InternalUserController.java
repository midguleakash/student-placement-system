package com.akash.auth.controller;

import com.akash.auth.dto.UserEmailResponse;
import com.akash.auth.model.User;
import com.akash.auth.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;
    private final String internalApiKey;

    public InternalUserController(
            UserRepository userRepository,
            @Value("${internal.api-key}") String internalApiKey
    ) {
        this.userRepository = userRepository;
        this.internalApiKey = internalApiKey;
    }

    @GetMapping("/{userId}/email")
    public UserEmailResponse getStudentEmail(
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

        User user = userRepository.findById(userId)
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student user not found"
                ));

        return new UserEmailResponse(user.getId(), user.getEmail());
    }
}