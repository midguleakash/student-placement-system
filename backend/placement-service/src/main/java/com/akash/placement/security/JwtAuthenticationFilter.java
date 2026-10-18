package com.akash.placement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7).trim();

        try {
            Claims claims = jwtService.validateAndGetClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Object rawUserId = claims.get("userId");

            if (email == null || email.isBlank()
                    || role == null
                    || rawUserId == null) {
                unauthorized(response);
                return;
            }

            if (!role.equals("STUDENT")
                    && !role.equals("COMPANY")
                    && !role.equals("ADMIN")) {
                response.sendError(
                        HttpServletResponse.SC_FORBIDDEN,
                        "This role cannot access the Placement Service endpoint."
                );
                return;
            }

            Long userId;

            try {
                userId = Long.valueOf(rawUserId.toString());
            } catch (NumberFormatException ex) {
                unauthorized(response);
                return;
            }

            if (userId <= 0) {
                unauthorized(response);
                return;
            }

            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority("ROLE_" + role)
                            )
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            request.setAttribute("userId", userId);
            request.setAttribute("email", email);
            request.setAttribute("role", role);

            filterChain.doFilter(request, response);

        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            unauthorized(response);
        }
    }

    private void unauthorized(HttpServletResponse response)
            throws IOException {
        response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "Invalid or expired JWT token."
        );
    }
}