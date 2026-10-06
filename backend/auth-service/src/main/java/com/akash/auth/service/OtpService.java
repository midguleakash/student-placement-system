package com.akash.auth.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, OtpData> otpStore =
            new ConcurrentHashMap<>();


    public String generateOtp(String email) {

        String normalizedEmail =
                email.toLowerCase().trim();

        String otp =
                String.valueOf(
                        100000 + secureRandom.nextInt(900000)
                );

        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(5);

        otpStore.put(
                normalizedEmail,
                new OtpData(otp, expiresAt)
        );

        return otp;
    }


    public boolean verifyOtp(
            String email,
            String enteredOtp) {

        String normalizedEmail =
                email.toLowerCase().trim();

        OtpData otpData =
                otpStore.get(normalizedEmail);

        // OTP doesn't exist
        if (otpData == null) {
            return false;
        }

        // OTP expired
        if (LocalDateTime.now()
                .isAfter(otpData.expiresAt())) {

            otpStore.remove(normalizedEmail);

            return false;
        }

        // OTP incorrect
        if (!otpData.otp()
                .equals(enteredOtp)) {

            return false;
        }

        // OTP correct
        otpStore.remove(normalizedEmail);

        return true;
    }


    private record OtpData(
            String otp,
            LocalDateTime expiresAt
    ) {
    }
}