package com.ecommerce.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.api.entity.SupportTicket;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByCustomer_EmailOrderByCreatedAtDesc(String email);

    Optional<SupportTicket> findByIdAndCustomer_Email(Long id, String email);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
