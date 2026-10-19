package com.akash.placement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ApplicantDetailsClient {

    private final RestClient authClient;
    private final RestClient studentClient;

    public ApplicantDetailsClient(
            RestClient.Builder builder,
            @Value("${auth.service.base-url}") String authBaseUrl,
            @Value("${student.service.base-url}") String studentBaseUrl,
            @Value("${internal.api-key}") String internalApiKey
    ) {
        this.authClient = builder.clone()
                .baseUrl(authBaseUrl)
                .defaultHeader("X-Internal-API-Key", internalApiKey)
                .build();

        this.studentClient = builder.clone()
                .baseUrl(studentBaseUrl)
                .defaultHeader("X-Internal-API-Key", internalApiKey)
                .build();
    }

    public String getStudentEmail(Long userId) {
        try {
            UserEmailResponse response = authClient.get()
                    .uri("/api/internal/users/{userId}/email", userId)
                    .retrieve()
                    .body(UserEmailResponse.class);

            return response == null ? null : response.email();
        } catch (org.springframework.web.client.RestClientException ex) {
            // Do not fail the entire applications list if a profile
            // lookup temporarily fails.
            return null;
        }
    }

    public String getStudentName(Long userId) {
        try {
            InternalStudentResponse response = studentClient.get()
                    .uri("/api/internal/students/{userId}", userId)
                    .retrieve()
                    .body(InternalStudentResponse.class);

            return response == null ? null : response.fullName();
        } catch (org.springframework.web.client.RestClientException ex) {
            return null;
        }
    }

    public record UserEmailResponse(Long userId, String email) {}

    public record InternalStudentResponse(
            Long userId,
            String firstName,
            String lastName,
            String fullName
    ) {}
}