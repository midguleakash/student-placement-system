
package com.akash.placement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentPlacementAccessService {

    private final RestClient restClient;

    public StudentPlacementAccessService(
            RestClient.Builder builder,
            @Value("${student.service.base-url}") String baseUrl) {

        this.restClient = builder
                .baseUrl(baseUrl)
                .build();
    }

    public boolean hasPlacementAccess(String authorizationHeader) {
        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication token is required."
            );
        }

        try {
            Boolean allowed = restClient.get()
                    .uri("/api/student/profile/placement-access")
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            authorizationHeader
                    )
                    .retrieve()
                    .body(Boolean.class);

            return Boolean.TRUE.equals(allowed);

        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to verify student placement approval. Please try again.",
                    ex
            );
        }
    }
}
