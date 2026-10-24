package com.ecommerce.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.api.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}