package com.akash.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/test")
    public String test() {
        return "Auth Service is working!";
    }

    @GetMapping("/")
    public String authHome() {
        return "Auth Controller is working!";
    }
}