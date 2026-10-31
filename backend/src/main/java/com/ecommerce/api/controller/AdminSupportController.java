package com.ecommerce.api.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.api.dto.SupportTicketResponse;
import com.ecommerce.api.dto.UpdateSupportTicketRequest;
import com.ecommerce.api.service.SupportTicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/support/tickets")
@Validated
public class AdminSupportController {

    private final SupportTicketService supportTicketService;

    public AdminSupportController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    public List<SupportTicketResponse> getAllTickets() {
        return supportTicketService.getAllTickets();
    }

    @PatchMapping("/{ticketId}")
    public SupportTicketResponse updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateSupportTicketRequest request) {
        return supportTicketService.updateTicket(ticketId, request);
    }
}
