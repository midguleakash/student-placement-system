
package com.akash.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;

    @Value("${sendlib.api-url}")
    private String apiUrl;

    @Value("${sendlib.api-key}")
    private String apiKey;

    @Value("${sendlib.from-email}")
    private String fromEmail;

    public EmailService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    /**
     * Reusable method to send an HTML email.
     */
    public void sendHtmlEmail(
            String toEmail,
            String subject,
            String htmlContent
    ) {
        Map<String, Object> requestBody = Map.of(
                "from", fromEmail,
                "to", toEmail,
                "subject", subject,
                "html", htmlContent
        );

        restClient.post()
                .uri(apiUrl)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiKey
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }

    /**
     * Send an OTP verification email.
     */
    public void sendOtpEmail(String toEmail, String otp) {

        String html = """
                <html>
                <body>
                    <h2>Student Placement System</h2>
                    <p>Hello,</p>
                    <p>Your email verification OTP is:</p>
                    <h1>%s</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Please do not share this OTP with anyone.</p>
                    <p>Regards,<br>Student Placement System</p>
                </body>
                </html>
                """.formatted(otp);

        sendHtmlEmail(
                toEmail,
                "Email Verification - Student Placement System",
                html
        );
    }

    /**
     * Send a registration confirmation email.
     */
    public void sendRegistrationConfirmationEmail(String toEmail) {

        String html = """
                <html>
                <body>
                    <h2>Registration Successful!</h2>
                    <p>Welcome to the Student Placement System.</p>
                    <p>Your account has been registered successfully.</p>
                    <p>You can now log in to your account.</p>
                    <p>Regards,<br>Student Placement System</p>
                </body>
                </html>
                """;

        sendHtmlEmail(
                toEmail,
                "Registration Successful - Student Placement System",
                html
        );
    }
}
