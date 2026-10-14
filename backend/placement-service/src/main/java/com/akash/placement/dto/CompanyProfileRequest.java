package com.akash.placement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record CompanyProfileRequest(
        @NotBlank
        @Size(max = 150)
        String companyName,

        @NotBlank
        @Size(max = 100)
        String industry,

        @Size(max = 255)
        String website,

        @NotBlank
        @Size(max = 100)
        String contactPerson,

        @NotBlank
        @Pattern(regexp = "[0-9+() -]{10,20}")
        String phone,

        @NotBlank
        @Email
        @Size(max = 254)
        String companyEmail,

        @NotBlank
        @Size(max = 500)
        String address,

        @NotBlank
        @Size(max = 3000)
        String description
) {}