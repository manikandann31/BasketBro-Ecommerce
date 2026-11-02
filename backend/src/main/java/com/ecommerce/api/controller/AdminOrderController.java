package com.ecommerce.api.controller;

import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.api.dto.OrderResponse;
import com.ecommerce.api.dto.UpdateOrderStatusRequest;
import com.ecommerce.api.service.OrderService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
@Validated
public class AdminOrderController {
    private final OrderService service;
    public AdminOrderController(OrderService service) { this.service = service; }

    @GetMapping
    public List<OrderResponse> all() { return service.all(); }

    @PatchMapping("/{orderNumber}/status")
    public OrderResponse updateStatus(@PathVariable String orderNumber, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return service.updateStatus(orderNumber, request);
    }
}
