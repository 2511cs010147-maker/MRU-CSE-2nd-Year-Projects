package com.edulytix.controller;

import com.edulytix.dto.LoginRequest;
import com.edulytix.dto.LoginResponse;
import com.edulytix.dto.RegisterRequest;
import com.edulytix.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String msg = (e.getMessage() != null && !e.getMessage().trim().isEmpty()) 
                    ? e.getMessage() 
                    : "Invalid login credentials. Please try again.";
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String msg = (e.getMessage() != null && !e.getMessage().trim().isEmpty()) 
                    ? e.getMessage() 
                    : "Failed to register account. Please check your details.";
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody RegisterRequest request) {
        return register(request);
    }
}
