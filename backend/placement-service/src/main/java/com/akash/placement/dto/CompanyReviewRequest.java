
package com.akash.placement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyReviewRequest(
        @NotBlank(message = "Remarks are required")
        @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
        String remarks
) {
}
