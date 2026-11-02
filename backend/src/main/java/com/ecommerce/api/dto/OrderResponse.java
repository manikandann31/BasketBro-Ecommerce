package com.ecommerce.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.ecommerce.api.entity.OrderStatus;

public record OrderResponse(
    String orderId, LocalDateTime createdAt, String paymentMethod, String paymentStatus,
    OrderStatus orderStatus, String customerName, String email, String phone,
    String address, String city, String state, String postalCode,
    List<Item> items, BigDecimal total
) {
    public record Item(Integer productId, String name, BigDecimal price, Integer quantity, BigDecimal subtotal) {}
}
