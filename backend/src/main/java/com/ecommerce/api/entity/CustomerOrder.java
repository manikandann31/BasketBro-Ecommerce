package com.ecommerce.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_orders")
@Getter @Setter @NoArgsConstructor
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 100) private String recipientName;
    @Column(nullable = false, length = 150) private String deliveryEmail;
    @Column(nullable = false, length = 20) private String phone;
    @Column(nullable = false, length = 500) private String address;
    @Column(nullable = false, length = 100) private String city;
    @Column(nullable = false, length = 100) private String state;
    @Column(nullable = false, length = 10) private String postalCode;

    @Column(nullable = false, length = 30) private String paymentMethod;
    @Column(nullable = false, length = 40) private String paymentStatus;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private OrderStatus orderStatus = OrderStatus.CONFIRMED;

    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal total;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
}
