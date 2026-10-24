package com.ecommerce.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String brand;

    private double price;

    private double rating;

    private int quantity;

    private String image;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}