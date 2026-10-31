package com.ecommerce.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(
        @NotBlank @Size(max = 150) String subject,
        @NotBlank @Size(max = 3000) String description,
        @Size(max = 80) String category) {
}
