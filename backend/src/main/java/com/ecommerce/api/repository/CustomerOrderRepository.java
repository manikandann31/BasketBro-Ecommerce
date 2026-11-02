package com.ecommerce.api.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.api.entity.CustomerOrder;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomer_EmailOrderByCreatedAtDesc(String email);
    Optional<CustomerOrder> findByOrderNumberAndCustomer_Email(String orderNumber, String email);
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}
