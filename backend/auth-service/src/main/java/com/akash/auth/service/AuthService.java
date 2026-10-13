package com.akash.auth.service;

import com.akash.auth.dto.AuthResponse;
import com.akash.auth.dto.LoginRequest;
import com.akash.auth.dto.LoginResponse;
import com.akash.auth.dto.RegisterRequest;

public interface AuthService {
    void sendRegistrationOtp(String email);

    void verifyRegistrationOtp(String email, String otp);

    LoginResponse registerCompany(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse registerStudent(RegisterRequest request);

}
