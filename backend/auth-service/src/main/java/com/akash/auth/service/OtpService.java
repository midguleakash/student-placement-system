
package com.akash.auth.service;

import com.akash.auth.dto.SendOtpRequest;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class OtpService {

    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private final ConcurrentMap<String, OtpEntry> otpStore =
            new ConcurrentHashMap<>();

    // Temporary registration data, used after OTP verification.
    private final ConcurrentMap<String, SendOtpRequest> pendingRegistrations =
            new ConcurrentHashMap<>();

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendOtp(SendOtpRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        String otp = String.format(
                "%06d", secureRandom.nextInt(1_000_000)
        );

        Instant expiresAt = Instant.now().plusSeconds(300);

        otpStore.put(email, new OtpEntry(otp, expiresAt));
        pendingRegistrations.put(email, request);

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (RuntimeException ex) {
            // Do not leave a usable OTP if email delivery fails.
            otpStore.remove(email);
            pendingRegistrations.remove(email);
            throw new IllegalStateException(
                    "Unable to send OTP email. Please try again."
            );
        }
    }

    private record OtpEntry(String otp, Instant expiresAt) {}
}
