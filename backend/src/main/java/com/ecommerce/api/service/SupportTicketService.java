package com.ecommerce.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.api.dto.CreateSupportTicketRequest;
import com.ecommerce.api.dto.SupportTicketResponse;
import com.ecommerce.api.dto.UpdateSupportTicketRequest;
import com.ecommerce.api.entity.Customer;
import com.ecommerce.api.entity.SupportTicket;
import com.ecommerce.api.repository.CustomerRepository;
import com.ecommerce.api.repository.SupportTicketRepository;

@Service
@Transactional
public class SupportTicketService {

    private final CustomerRepository customerRepository;
    private final SupportTicketRepository ticketRepository;

    public SupportTicketService(
            CustomerRepository customerRepository,
            SupportTicketRepository ticketRepository) {
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
    }

    public SupportTicketResponse createTicket(
            String customerEmail, CreateSupportTicketRequest request) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer account not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setCustomer(customer);
        ticket.setSubject(request.subject().trim());
        ticket.setDescription(request.description().trim());
        ticket.setCategory(request.category() == null ? null : request.category().trim());

        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMyTickets(String customerEmail) {
        return ticketRepository.findByCustomer_EmailOrderByCreatedAtDesc(customerEmail)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getMyTicket(Long ticketId, String customerEmail) {
        SupportTicket ticket = ticketRepository
                .findByIdAndCustomer_Email(ticketId, customerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Support ticket not found"));
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public SupportTicketResponse updateTicket(
            Long ticketId, UpdateSupportTicketRequest request) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Support ticket not found"));

        ticket.setStatus(request.status());
        if (request.adminResponse() != null) {
            ticket.setAdminResponse(request.adminResponse().trim());
        }

        return toResponse(ticketRepository.save(ticket));
    }

    private SupportTicketResponse toResponse(SupportTicket ticket) {
        Customer customer = ticket.getCustomer();
        return new SupportTicketResponse(
                ticket.getId(),
                customer.getFullName(),
                customer.getEmail(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getStatus(),
                ticket.getAdminResponse(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt());
    }
}
