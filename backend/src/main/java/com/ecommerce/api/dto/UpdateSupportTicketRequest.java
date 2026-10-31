package com.ecommerce.api.dto;

import com.ecommerce.api.entity.SupportTicketStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSupportTicketRequest(
        @NotNull SupportTicketStatus status,
        @Size(max = 3000) String adminResponse) {
}
