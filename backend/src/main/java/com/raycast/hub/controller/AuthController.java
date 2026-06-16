package com.raycast.hub.controller;

import com.raycast.hub.dto.ApiResponse;
import com.raycast.hub.exception.BadRequestException;
import com.raycast.hub.exception.InvalidCredentialsException;
import com.raycast.hub.model.User;
import com.raycast.hub.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new BadRequestException("Email and password are required fields");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("A user with this email address already exists");
        }

        User user = new User(email, passwordEncoder.encode(password), "LOCAL");
        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", saved));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new BadRequestException("Email and password are required fields");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty() || !passwordEncoder.matches(password, optionalUser.get().getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return ResponseEntity.ok(ApiResponse.success("Login successful", optionalUser.get()));
    }

    @PostMapping("/oauth")
    public ResponseEntity<ApiResponse<User>> oauthLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String provider = request.get("provider");

        if (email == null || email.isEmpty() || provider == null || provider.isEmpty()) {
            throw new BadRequestException("Email and provider are required fields");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        if (optionalUser.isEmpty()) {
            user = new User(email, passwordEncoder.encode("OAUTH_USER_RANDOM_SECRET_" + Math.random()), provider.toUpperCase());
            user = userRepository.save(user);
        } else {
            user = optionalUser.get();
        }

        return ResponseEntity.ok(ApiResponse.success("OAuth authentication successful", user));
    }
}
