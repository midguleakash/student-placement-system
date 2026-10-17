
package com.akash.placement.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JobRequest(
        @NotBlank
        @Size(max = 150)
        String title,

        @NotBlank
        @Size(max = 5000)
        String description,

        @NotBlank
        @Size(max = 2000)
        String requiredSkills,

        @DecimalMin("0.00")
        @DecimalMax("10.00")
        BigDecimal minimumCgpa,

        @Min(0)
        @Max(100)
        Integer maximumActiveBacklogs,

        @Size(max = 100)
        String eligibleGraduationYears,

        @DecimalMin("0.00")
        BigDecimal salary,

        @Size(max = 150)
        String location,

        @Pattern(
                regexp = "(?i)ONSITE|HYBRID|REMOTE",
                message = "Work mode must be ONSITE, HYBRID, or REMOTE"
        )
        String workMode,

        @NotNull
        @Min(1)
        @Max(100000)
        Integer vacancies,

        @NotNull
        @Future
        LocalDateTime applicationDeadline
) {}
