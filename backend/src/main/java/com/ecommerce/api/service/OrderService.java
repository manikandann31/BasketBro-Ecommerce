package com.ecommerce.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.ecommerce.api.dto.CreateOrderRequest;
import com.ecommerce.api.dto.OrderResponse;
import com.ecommerce.api.dto.UpdateOrderStatusRequest;
import com.ecommerce.api.entity.*;
import com.ecommerce.api.repository.*;

@Service
@Transactional
public class OrderService {
    private final CustomerRepository customers;
    private final ProductRepository products;
    private final CustomerOrderRepository orders;

    public OrderService(CustomerRepository customers, ProductRepository products, CustomerOrderRepository orders) {
        this.customers = customers; this.products = products; this.orders = orders;
    }

    public OrderResponse create(String email, CreateOrderRequest request) {
        Customer customer = customers.findByEmail(email).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer account not found"));
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber("BB" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        order.setCustomer(customer);
        order.setRecipientName(request.recipientName().trim());
        order.setDeliveryEmail(request.email().trim().toLowerCase());
        order.setPhone(request.phone().trim());
        order.setAddress(request.address().trim());
        order.setCity(request.city().trim());
        order.setState(request.state().trim());
        order.setPostalCode(request.postalCode().trim());
        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentStatus("CASH_ON_DELIVERY".equals(request.paymentMethod()) ? "PAY ON DELIVERY" : "SIMULATED SUCCESS");
        order.setOrderStatus(OrderStatus.CONFIRMED);

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderLineRequest line : request.items()) {
            Product product = products.findByIdForInventoryUpdate(line.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + line.productId() + " not found"));
            if (product.getQuantity() < line.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for " + product.getName());
            }
            product.setQuantity(product.getQuantity() - line.quantity());
            BigDecimal unit = BigDecimal.valueOf(product.getPrice());
            BigDecimal subtotal = unit.multiply(BigDecimal.valueOf(line.quantity()));
            OrderItem item = new OrderItem();
            item.setOrder(order); item.setProductId(product.getId()); item.setProductName(product.getName());
            item.setUnitPrice(unit); item.setQuantity(line.quantity()); item.setSubtotal(subtotal);
            order.getItems().add(item);
            total = total.add(subtotal);
        }
        order.setTotal(total);
        return toResponse(orders.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> mine(String email) {
        return orders.findByCustomer_EmailOrderByCreatedAtDesc(email).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse mineByNumber(String orderNumber, String email) {
        CustomerOrder order = orders.findByOrderNumberAndCustomer_Email(orderNumber, email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> all() {
        return orders.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public OrderResponse updateStatus(String orderNumber, UpdateOrderStatusRequest request) {
        CustomerOrder order = orders.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        OrderStatus previous = order.getOrderStatus();
        OrderStatus next = request.status();
        if (previous == OrderStatus.CANCELLED || previous == OrderStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already in a final state");
        }
        if (next == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) products.restoreStock(item.getProductId(), item.getQuantity());
        }
        order.setOrderStatus(next);
        return toResponse(order);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(order.getOrderNumber(), order.getCreatedAt(), order.getPaymentMethod(),
            order.getPaymentStatus(), order.getOrderStatus(), order.getRecipientName(), order.getDeliveryEmail(),
            order.getPhone(), order.getAddress(), order.getCity(), order.getState(), order.getPostalCode(),
            order.getItems().stream().map(i -> new OrderResponse.Item(i.getProductId(), i.getProductName(),
                i.getUnitPrice(), i.getQuantity(), i.getSubtotal())).toList(), order.getTotal());
    }
}
