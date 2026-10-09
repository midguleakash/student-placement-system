package com.akash.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/register/send-otp")
    public ResponseEntity<Map<String, String>> testSendOtp(
            @RequestBody Map<String, Object> request) {

        System.out.println("========== AUTH SERVICE ==========");
        System.out.println("Received Send OTP request!");
        System.out.println("Email: " + request.get("email"));
        System.out.println("==================================");

        return ResponseEntity.ok(Map.of(
                "message", "Request successfully reached Auth Service",
                "status", "SUCCESS"
        ));
    }
}