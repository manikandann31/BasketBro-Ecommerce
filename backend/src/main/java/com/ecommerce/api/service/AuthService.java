package com.ecommerce.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.api.entity.Admin;
import com.ecommerce.api.repository.AdminRepository;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String username, String password) {

        Admin admin = adminRepository
                .findByUsername(username)
                .orElse(null);

        if (admin == null) {
            return null;
        }

        if (!passwordEncoder.matches(
                password,
                admin.getPassword())) {

            return null;
        }

        return jwtService.generateToken(
                admin.getUsername()
        );
    }
}