package com.ecommerce.api.dto;

import java.time.LocalDateTime;

import com.ecommerce.api.entity.SupportTicketStatus;

public record SupportTicketResponse(
        Long id,
        String customerName,
        String customerEmail,
        String subject,
        String description,
        String category,
        SupportTicketStatus status,
        String adminResponse,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
