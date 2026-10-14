package com.akash.auth.config;

import com.akash.auth.model.User;
import com.akash.auth.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword
    ) {
        return args -> {

            // Do not create an admin if credentials are not configured.
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                System.out.println(
                        "Admin initialization skipped: credentials not configured."
                );
                return;
            }

            String email = adminEmail.trim().toLowerCase(
                    java.util.Locale.ROOT
            );

            // Do not overwrite an existing account.
            if (userRepository.existsByEmail(email)) {
                System.out.println(
                        "Admin account already exists: " + email
                );
                return;
            }

            User admin = new User();
            admin.setEmail(email);
            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );
            admin.setRole(User.Role.ADMIN);
            admin.setEmailVerified(true);

            userRepository.save(admin);

            System.out.println("Initial admin account created.");
        };
    }
}