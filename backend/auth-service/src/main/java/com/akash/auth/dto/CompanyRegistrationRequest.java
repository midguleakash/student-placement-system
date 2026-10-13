
package com.akash.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRegistrationRequest(

        @NotBlank
        @Size(max = 150)
        String companyName,

        @NotBlank
        @Email
        String email,

        @NotBlank
        String phone,

        @NotBlank
        String location,

        @NotBlank
        String domain,

        @NotBlank
        String headOffice,

        @NotBlank
        @Size(min = 8, max = 72)
        String password

) {}
