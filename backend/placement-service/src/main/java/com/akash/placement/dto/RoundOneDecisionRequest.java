
package com.akash.placement.dto;

import com.akash.placement.enums.RecruitmentRoundStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RoundOneDecisionRequest(

        @NotNull(message = "Decision is required")
        RecruitmentRoundStatus decision,

        @Size(max = 2000, message = "Feedback cannot exceed 2000 characters")
        String feedback,

        @DecimalMin(value = "0.00", message = "Score cannot be below 0")
        @DecimalMax(value = "100.00", message = "Score cannot exceed 100")
        BigDecimal score

) {
}
