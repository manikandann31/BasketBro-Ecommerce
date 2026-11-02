package com.ecommerce.api.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.api.dto.CreateSupportTicketRequest;
import com.ecommerce.api.dto.SupportTicketResponse;
import com.ecommerce.api.service.SupportTicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/support/tickets")
@Validated
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(
            Principal principal,
            @Valid @RequestBody CreateSupportTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supportTicketService.createTicket(principal.getName(), request));
    }

    @GetMapping("/mine")
    public List<SupportTicketResponse> getMyTickets(Principal principal) {
        return supportTicketService.getMyTickets(principal.getName());
    }

    @GetMapping("/{ticketId}")
    public SupportTicketResponse getMyTicket(
            Principal principal, @PathVariable Long ticketId) {
        return supportTicketService.getMyTicket(ticketId, principal.getName());
    }
}
