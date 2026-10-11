package com.akash.auth.service;

import com.akash.auth.dto.RegisterRequest;

public interface AuthService {
    void sendRegistrationOtp(String email);

    void verifyRegistrationOtp(String email, String otp);

    void registerStudent(RegisterRequest request);
}
