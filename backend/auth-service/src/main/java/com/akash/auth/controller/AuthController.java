package com.akash.auth.controller;

import com.akash.auth.dto.SendOtpRequest;
import com.akash.auth.dto.VerifyOtpRequest;
import com.akash.auth.service.EmailService;
import com.akash.auth.service.OtpService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OtpService otpService;

    private final EmailService emailService;


    public AuthController(
            OtpService otpService,
            EmailService emailService) {

        this.otpService = otpService;

        this.emailService = emailService;
    }


    // =========================
    // SEND OTP
    // =========================

    @PostMapping("/register/send-otp")
    public ResponseEntity<String> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        String email =
                request.getEmail()
                        .toLowerCase()
                        .trim();


        // Generate OTP
        String otp =
                otpService.generateOtp(email);


        try {

            // Send OTP using Sendlib
            emailService.sendOtpEmail(
                    email,
                    otp
            );

            return ResponseEntity.ok(
                    "OTP sent successfully to your email."
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to send OTP email."
                    );
        }
    }


    // =========================
    // VERIFY OTP
    // =========================

    @PostMapping("/register/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {


        boolean verified =
                otpService.verifyOtp(
                        request.getEmail(),
                        request.getOtp()
                );


        if (!verified) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid or expired OTP."
                    );
        }


        return ResponseEntity.ok(
                "Email verified successfully."
        );
    }
}