package com.akash.auth.service;

import ch.qos.logback.classic.encoder.JsonEncoder;
import com.akash.auth.dto.AuthResponse;
import com.akash.auth.dto.LoginRequest;
import com.akash.auth.dto.RegisterRequest;
import com.akash.auth.model.User;
import com.akash.auth.repository.UserRepository;
import com.akash.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            OtpService otpService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public void sendRegistrationOtp(String email) {

        String normalizedEmail =
                email.trim().toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "This email is already registered."
            );
        }

        otpService.sendOtp(normalizedEmail);
    }

    @Override
    public void verifyRegistrationOtp(String email, String otp) {

        otpService.verifyOtp(email, otp);
    }

    @Override
    public void registerStudent(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        // Prevent duplicate accounts.
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // The backend checks its own OTP verification record.
        // This method must consume verification only for this email.
        if (!otpService.consumeEmailVerification(email)) {
            throw new IllegalArgumentException(
                    "Please verify this email before registering."
            );
        }

        User user = new User();

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());

        // Never store the plain-text password.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Do not accept the role from the frontend.
        user.setRole(User.Role.STUDENT);
        user.setEmailVerified(true);

        userRepository.save(user);
    }


    @Override
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before logging in."
            );
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getRole().name(),
                "Login successful."
        );
    }
}