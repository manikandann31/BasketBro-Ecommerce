package com.ecommerce.api.dto;

public record AuthResponse(
        String message,
        String token,
        String role) {
}
