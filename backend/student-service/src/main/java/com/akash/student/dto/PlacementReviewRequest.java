
package com.akash.student.dto;

import jakarta.validation.constraints.Size;

public record PlacementReviewRequest(
        @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
        String remarks
) {}
