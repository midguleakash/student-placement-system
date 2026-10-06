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
    private String sendlibApiUrl;

    @Value("${sendlib.api-key}")
    private String sendlibApiKey;

    @Value("${sendlib.from-email}")
    private String fromEmail;


    public EmailService(RestClient.Builder restClientBuilder) {

        this.restClient =
                restClientBuilder.build();
    }


    public void sendOtpEmail(
            String toEmail,
            String otp) {

        String html = """
                <html>
                <body>

                    <h2>Student Placement System</h2>

                    <p>Hello,</p>

                    <p>
                        Your OTP for email verification is:
                    </p>

                    <h1>%s</h1>

                    <p>
                        This OTP is valid for
                        <b>5 minutes</b>.
                    </p>

                    <p>
                        Please do not share this OTP
                        with anyone.
                    </p>

                    <br>

                    <p>
                        Regards,<br>
                        Student Placement System
                    </p>

                </body>
                </html>
                """.formatted(otp);


        Map<String, Object> requestBody =
                Map.of(
                        "from", fromEmail,
                        "to", toEmail,
                        "subject",
                        "Student Placement System - Email Verification",
                        "html", html
                );


        restClient.post()

                .uri(sendlibApiUrl)

                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + sendlibApiKey
                )

                .contentType(
                        MediaType.APPLICATION_JSON
                )

                .body(requestBody)

                .retrieve()

                .toBodilessEntity();
    }
}