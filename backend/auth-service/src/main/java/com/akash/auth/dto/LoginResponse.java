package com.akash.auth.dto;

public class LoginResponse {

    private final String token;
    private final Long userId;
    private final String role;
    private final String message;

    public LoginResponse(
            String token,
            Long userId,
            String role,
            String message) {

        this.token = token;
        this.userId = userId;
        this.role = role;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}