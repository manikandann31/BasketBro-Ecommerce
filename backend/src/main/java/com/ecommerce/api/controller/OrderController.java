package com.ecommerce.api.controller;

import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.api.dto.CreateOrderRequest;
import com.ecommerce.api.dto.OrderResponse;
import com.ecommerce.api.service.OrderService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(Principal principal, @Valid @RequestBody CreateOrderRequest request) {
        return service.create(principal.getName(), request);
    }

    @GetMapping("/mine")
    public List<OrderResponse> mine(Principal principal) { return service.mine(principal.getName()); }

    @GetMapping("/{orderNumber}")
    public OrderResponse mineByNumber(Principal principal, @PathVariable String orderNumber) {
        return service.mineByNumber(orderNumber, principal.getName());
    }
}
