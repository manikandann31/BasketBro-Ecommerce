package com.ecommerce.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.api.dto.AuthResponse;
import com.ecommerce.api.dto.CustomerLoginRequest;
import com.ecommerce.api.dto.CustomerRegistrationRequest;
import com.ecommerce.api.service.CustomerAuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer/auth")
@Validated
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    public CustomerAuthController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody CustomerRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerAuthService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody CustomerLoginRequest request) {
        return customerAuthService.login(request);
    }
}
