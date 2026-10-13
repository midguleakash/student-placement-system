package com.akash.auth.service;


import com.akash.auth.dto.LoginRequest;
import com.akash.auth.dto.LoginResponse;
import com.akash.auth.dto.RegisterRequest;
import com.akash.auth.model.User;
import com.akash.auth.repository.UserRepository;
import com.akash.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public LoginResponse registerCompany(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // OTP verification must be confirmed by the backend.
        if (!otpService.consumeEmailVerification(email)) {
            throw new IllegalArgumentException(
                    "Please verify your email before registering."
            );
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // The backend assigns the role.
        user.setRole(User.Role.COMPANY);
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getRole().name(),
                "Company account created successfully."
        );
    }

    @Override
    @Transactional
    public LoginResponse registerStudent(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // Verify and consume the email verification on the backend.
        if (!otpService.consumeEmailVerification(email)) {
            throw new IllegalArgumentException(
                    "Please verify your email before registering."
            );
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Assign the role on the backend.
        user.setRole(User.Role.STUDENT);
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getRole().name(),
                "Student account created successfully."
        );
    }

    @Override
    public LoginResponse login(LoginRequest request) {

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

        return new LoginResponse(
                token,
                user.getId(),
                user.getRole().name(),
                "Login successful."
        );
    }
}


