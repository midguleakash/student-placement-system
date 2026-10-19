package com.akash.student.dto;

public record InternalStudentResponse(
        Long userId,
        String firstName,
        String lastName,
        String fullName
) {}