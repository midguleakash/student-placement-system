
package com.akash.placement.service;

import com.akash.placement.dto.StudentScreeningData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class StudentScreeningClient {

    private final RestClient restClient;

    public StudentScreeningClient(
            RestClient.Builder builder,
            @Value("${student.service.base-url}") String baseUrl,
            @Value("${internal.api-key}") String apiKey) {

        this.restClient = builder.clone()
                .baseUrl(baseUrl)
                .defaultHeader("X-Internal-API-Key", apiKey)
                .build();
    }

    public StudentScreeningData getStudent(Long userId) {
        return restClient.get()
                .uri("/api/internal/students/{userId}/screening", userId)
                .retrieve()
                .body(StudentScreeningData.class);
    }

    public byte[] getResume(Long userId) {
        return restClient.get()
                .uri("/api/internal/students/{userId}/resume", userId)
                .accept(MediaType.APPLICATION_PDF)
                .retrieve()
                .body(byte[].class);
    }
}
