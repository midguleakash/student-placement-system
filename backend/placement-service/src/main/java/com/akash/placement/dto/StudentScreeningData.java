
package com.akash.placement.dto;

public record StudentScreeningData(
        Long userId,
        String firstName,
        String lastName,
        String branch,
        Integer graduationYear,
        Double cgpa,
        Integer activeBacklogs,
        String skills,
        String profileStatus,
        String placementRegistrationStatus,
        boolean hasResume
) {
}
