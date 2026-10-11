package com.akash.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class OtpService {

    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    private final ConcurrentMap<String, OtpEntry> otpStore =
            new ConcurrentHashMap<>();

    private final Set<String> verifiedEmails =
            ConcurrentHashMap.newKeySet();

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendOtp(String email) {

        String normalizedEmail = normalize(email);

        String otp = String.format(
                "%06d",
                random.nextInt(1_000_000)
        );

        Instant expiry = Instant.now().plusSeconds(300);

        OtpEntry entry = new OtpEntry(otp, expiry);

        // Store before sending; remove it if email sending fails.
        otpStore.put(normalizedEmail, entry);
        verifiedEmails.remove(normalizedEmail);

        try {
            emailService.sendOtpEmail(normalizedEmail, otp);
        } catch (RuntimeException ex) {
            otpStore.remove(normalizedEmail, entry);
            throw new IllegalStateException(
                    "Unable to send OTP email. Please try again."
            );
        }
    }

    public void verifyOtp(String email, String otp) {

        String normalizedEmail = normalize(email);

        OtpEntry entry = otpStore.get(normalizedEmail);

        if (entry == null) {
            throw new IllegalArgumentException(
                    "OTP not found. Please request a new OTP."
            );
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(normalizedEmail, entry);

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (!entry.otp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        // A valid OTP is single-use.
        if (!otpStore.remove(normalizedEmail, entry)) {
            throw new IllegalArgumentException(
                    "OTP has already been used or replaced."
            );
        }

        verifiedEmails.add(normalizedEmail);
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.contains(normalize(email));
    }

    public boolean consumeEmailVerification(String email) {

        if (!verifiedEmails.remove(email)) {
            return false;
        }

        return true;
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private record OtpEntry(String otp, Instant expiresAt) {
    }
}