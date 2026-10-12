package com.akash.auth.controller;

import com.akash.auth.dto.*;
import com.akash.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Auth Service is running");
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        authService.sendRegistrationOtp(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse(
                        "OTP sent successfully.",
                        "SUCCESS"
                )
        );
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        authService.verifyRegistrationOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(
                new ApiResponse(
                        "Email verified successfully.",
                        "SUCCESS"
                )
        );
    }

    @PostMapping("/register/complete")
    public ResponseEntity<ApiResponse> completeRegistration(
            @Valid @RequestBody RegisterRequest request) {

        authService.registerStudent(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse(
                        "Student account created successfully.",
                        "SUCCESS"
                )
        );
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}