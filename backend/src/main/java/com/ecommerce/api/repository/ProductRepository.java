
package com.ecommerce.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.api.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

	// Existing product filtering methods
	List<Product> findByBrand(String brand);

	List<Product> findByPriceBetween(double start, double end);

	List<Product> findByRatingBetween(double start, double end);

	List<Product> findByCategoryId(Long categoryId);

	// Existing product search with optional category filtering
	@Query("""
			SELECT p FROM Product p
			WHERE
			    (:keyword = '' OR
			     LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
			     OR
			     LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
			AND
			    (:categoryId IS NULL OR p.category.id = :categoryId)
			""")
	Page<Product> searchProducts(@Param("keyword") String keyword, @Param("categoryId") Long categoryId,
			Pageable pageable);

	// Retrieve a product while acquiring a database write lock.
	// The calling service must execute this method inside a transaction.
	@Query("""
			SELECT p FROM Product p
			WHERE p.id = :productId
			""")
	@org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
	Optional<Product> findByIdForInventoryUpdate(@Param("productId") Integer productId);

	// Atomically decrement inventory only when sufficient stock exists.
	// Returns 1 when updated and 0 when the product is missing or stock is
	// insufficient.
	@Modifying
	@Query("""
			UPDATE Product p
			SET p.quantity = p.quantity - :requestedQuantity
			WHERE p.id = :productId
			  AND :requestedQuantity > 0
			  AND p.quantity >= :requestedQuantity
			""")
	int decrementStockIfAvailable(@Param("productId") Integer productId,
			@Param("requestedQuantity") int requestedQuantity);

	// Restore inventory when an eligible order is cancelled or a reservation
	// expires.
	@Modifying
	@Query("""
			UPDATE Product p
			SET p.quantity = p.quantity + :restoreQuantity
			WHERE p.id = :productId
			  AND :restoreQuantity > 0
			""")
	int restoreStock(@Param("productId") Integer productId, @Param("restoreQuantity") int restoreQuantity);
}
