package com.ecommerce.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.api.entity.ProductImage;

public interface ProductImageRepository
        extends JpaRepository<ProductImage, Integer> {
}