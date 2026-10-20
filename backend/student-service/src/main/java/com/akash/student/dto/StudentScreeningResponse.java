
package com.akash.student.dto;

import com.akash.student.enums.PlacementRegistrationStatus;
import com.akash.student.enums.ProfileStatus;

public record StudentScreeningResponse(
        Long userId,
        String firstName,
        String lastName,
        String branch,
        Integer graduationYear,
        Double cgpa,
        Integer activeBacklogs,
        String skills,
        ProfileStatus profileStatus,
        PlacementRegistrationStatus placementRegistrationStatus,
        boolean hasResume
) {
}
