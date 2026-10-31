package com.ecommerce.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.api.dto.AuthResponse;
import com.ecommerce.api.dto.CustomerLoginRequest;
import com.ecommerce.api.dto.CustomerRegistrationRequest;
import com.ecommerce.api.entity.Customer;
import com.ecommerce.api.repository.CustomerRepository;

@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CustomerAuthService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(CustomerRegistrationRequest request) {
        String email = request.email().trim().toLowerCase();

        if (customerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Customer customer = new Customer();
        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(request.phone().trim());
        customer.setPassword(passwordEncoder.encode(request.password()));
        customerRepository.save(customer);

        return new AuthResponse(
                "Customer registered successfully",
                jwtService.generateToken(email, "CUSTOMER"),
                "CUSTOMER");
    }

    public AuthResponse login(CustomerLoginRequest request) {
        String email = request.email().trim().toLowerCase();

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), customer.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return new AuthResponse(
                "Customer login successful",
                jwtService.generateToken(email, "CUSTOMER"),
                "CUSTOMER");
    }
}
