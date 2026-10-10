
package com.akash.auth.controller;

import com.akash.auth.dto.SendOtpRequest;
import com.akash.auth.service.OtpService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OtpService otpService;

    public AuthController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        otpService.sendOtp(request);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "OTP sent successfully to your email"
        ));
    }
}
