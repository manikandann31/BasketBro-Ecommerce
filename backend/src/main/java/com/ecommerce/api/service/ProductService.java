package com.ecommerce.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.api.entity.Category;
import com.ecommerce.api.entity.Product;
import com.ecommerce.api.exception.ProductNotFoundException;
import com.ecommerce.api.repository.CategoryRepository;
import com.ecommerce.api.repository.ProductRepository;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;

	public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {

		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
	}

	// CREATE PRODUCT
	@Transactional
	public Product createProduct(Product product) {

		validateProduct(product);

		if (product.getCategory() == null || product.getCategory().getId() == null) {
			throw new IllegalArgumentException("A valid category is required.");
		}

		Category category = categoryRepository.findById(product.getCategory().getId())
				.orElseThrow(() -> new IllegalArgumentException("Category not found."));

		product.setCategory(category);

		return productRepository.save(product);
	}

	// GET ALL PRODUCTS
	@Transactional(readOnly = true)
	public List<Product> getAllProducts() {
		return productRepository.findAll();
	}

	// GET PRODUCT BY ID
	@Transactional(readOnly = true)
	public Product getProductById(Integer id) {

		return productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));
	}

	// UPDATE PRODUCT
	@Transactional
	public Product updateProduct(Integer id, Product updatedProduct) {

		validateProduct(updatedProduct);

		Product existingProduct = productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));

		if (updatedProduct.getCategory() == null || updatedProduct.getCategory().getId() == null) {
			throw new IllegalArgumentException("A valid category is required.");
		}

		Category category = categoryRepository.findById(updatedProduct.getCategory().getId())
				.orElseThrow(() -> new IllegalArgumentException("Category not found."));

		existingProduct.setName(updatedProduct.getName().trim());
		existingProduct.setBrand(updatedProduct.getBrand());
		existingProduct.setPrice(updatedProduct.getPrice());
		existingProduct.setRating(updatedProduct.getRating());
		existingProduct.setQuantity(updatedProduct.getQuantity());

		// Preserve the existing image if no new filename is provided.
		if (updatedProduct.getImage() != null && !updatedProduct.getImage().isBlank()) {
			existingProduct.setImage(updatedProduct.getImage());
		}

		existingProduct.setCategory(category);

		return productRepository.save(existingProduct);
	}

	// VALIDATE PRODUCT FIELDS
	private void validateProduct(Product product) {

		if (product == null) {
			throw new IllegalArgumentException("Product details are required.");
		}

		if (product.getName() == null || product.getName().isBlank()) {
			throw new IllegalArgumentException("Product name cannot be empty.");
		}

		if (!Double.isFinite(product.getPrice()) || product.getPrice() <= 0) {
			throw new IllegalArgumentException("Product price must be greater than zero.");
		}

		if (!Double.isFinite(product.getRating()) || product.getRating() < 0 || product.getRating() > 5) {
			throw new IllegalArgumentException("Product rating must be between 0 and 5.");
		}

		if (product.getQuantity() < 0) {
			throw new IllegalArgumentException("Product quantity cannot be negative.");
		}
	}

	// DECREASE STOCK SAFELY
	// Call this from a transactional order service.
	@Transactional
	public void decreaseStock(Integer productId, int requestedQuantity) {

		if (requestedQuantity <= 0) {
			throw new IllegalArgumentException("Requested quantity must be greater than zero.");
		}

		int updatedRows = productRepository.decrementStockIfAvailable(productId, requestedQuantity);

		if (updatedRows == 0) {

			Product product = productRepository.findById(productId)
					.orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));

			throw new IllegalStateException("Insufficient stock for " + product.getName() + ". Available quantity: "
					+ product.getQuantity() + ", requested quantity: " + requestedQuantity);
		}
	}

	// RESTORE STOCK
	// Only call when an order or reservation legitimately releases stock.
	@Transactional
	public void restoreStock(Integer productId, int restoreQuantity) {

		if (restoreQuantity <= 0) {
			throw new IllegalArgumentException("Restore quantity must be greater than zero.");
		}

		int updatedRows = productRepository.restoreStock(productId, restoreQuantity);

		if (updatedRows == 0) {
			throw new ProductNotFoundException("Product not found with ID: " + productId);
		}
	}

	// UPLOAD IMAGE
	public String uploadImage(String directory, MultipartFile file) throws IOException {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Please select an image.");
		}

		String originalName = file.getOriginalFilename();

		if (originalName == null || originalName.isBlank()) {
			throw new IllegalArgumentException("Invalid filename.");
		}

		String extension = "";
		int dotIndex = originalName.lastIndexOf('.');

		if (dotIndex >= 0) {
			extension = originalName.substring(dotIndex).toLowerCase();
		}

		if (!extension.matches("\\.(jpg|jpeg|png|webp|gif)")) {
			throw new IllegalArgumentException("Only JPG, JPEG, PNG, WEBP and GIF images are allowed.");
		}

		Path directoryPath = Paths.get(directory).toAbsolutePath().normalize();

		Files.createDirectories(directoryPath);

		String filename = UUID.randomUUID() + extension;
		Path destination = directoryPath.resolve(filename).normalize();

		if (!destination.startsWith(directoryPath)) {
			throw new IllegalArgumentException("Invalid image path.");
		}

		Files.copy(file.getInputStream(), destination);

		return filename;
	}

	// UPDATE PRODUCT IMAGE
	@Transactional
	public Product updateProductImage(int id, MultipartFile file) throws IOException {

		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));

		String filename = uploadImage("images", file);
		product.setImage(filename);

		return productRepository.save(product);
	}

	// DELETE PRODUCT
	@Transactional
	public void deleteProduct(Integer id) {

		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));

		productRepository.delete(product);
	}

	// FILTER PRODUCTS BY BRAND
	@Transactional(readOnly = true)
	public List<Product> getProductsByBrand(String brand) {
		return productRepository.findByBrand(brand);
	}

	// FILTER PRODUCTS BY PRICE RANGE
	@Transactional(readOnly = true)
	public List<Product> getProductsByPriceRange(double start, double end) {

		validateRange(start, end, "price");

		return productRepository.findByPriceBetween(start, end);
	}

	// FILTER PRODUCTS BY RATING RANGE
	@Transactional(readOnly = true)
	public List<Product> getProductsByRatingRange(double start, double end) {

		validateRange(start, end, "rating");

		if (start < 0 || end > 5) {
			throw new IllegalArgumentException("Rating range must be between 0 and 5.");
		}

		return productRepository.findByRatingBetween(start, end);
	}

	// FILTER PRODUCTS BY CATEGORY
	@Transactional(readOnly = true)
	public List<Product> getProductsByCategory(Long categoryId) {
		return productRepository.findByCategoryId(categoryId);
	}

	// GET PAGINATED PRODUCTS
	@Transactional(readOnly = true)
	public Page<Product> getProducts(Pageable pageable) {
		return productRepository.findAll(pageable);
	}

	// SEARCH PRODUCTS WITH OPTIONAL CATEGORY FILTER
	@Transactional(readOnly = true)
	public Page<Product> searchProducts(String keyword, Long categoryId, Pageable pageable) {

		if (keyword == null) {
			keyword = "";
		}

		return productRepository.searchProducts(keyword.trim(), categoryId, pageable);
	}

	// EXISTING CONVENIENCE METHODS
	@Transactional(readOnly = true)
	public List<Product> findByBrand(String brand) {
		return productRepository.findByBrand(brand);
	}

	@Transactional(readOnly = true)
	public List<Product> findByPriceBetween(double start, double end) {
		validateRange(start, end, "price");
		return productRepository.findByPriceBetween(start, end);
	}

	@Transactional(readOnly = true)
	public List<Product> findByRatingBetween(double start, double end) {
		validateRange(start, end, "rating");
		return productRepository.findByRatingBetween(start, end);
	}

	@Transactional(readOnly = true)
	public List<Product> findByCategoryId(Long categoryId) {
		return productRepository.findByCategoryId(categoryId);
	}

	private void validateRange(double start, double end, String field) {

		if (!Double.isFinite(start) || !Double.isFinite(end) || start < 0 || end < start) {
			throw new IllegalArgumentException("Invalid " + field + " range.");
		}
	}
}
