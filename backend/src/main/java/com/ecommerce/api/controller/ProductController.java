package com.ecommerce.api.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.api.entity.Product;
import com.ecommerce.api.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    // Constructor injection: @Autowired is unnecessary with one constructor.
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // CREATE PRODUCT
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    // GET ALL PRODUCTS
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // GET PRODUCT BY ID
    @GetMapping("/id/{id}")
    public Product getProductById(@PathVariable Integer id) {
        return productService.getProductById(id);
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Integer id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }

    // FILTER BY BRAND
    @GetMapping("/brand/{brand}")
    public List<Product> findByBrand(@PathVariable String brand) {
        return productService.findByBrand(brand);
    }

    // FILTER BY PRICE RANGE
    @GetMapping("/price/{start}/{end}")
    public List<Product> findByPriceBetween(
            @PathVariable double start,
            @PathVariable double end) {

        return productService.findByPriceBetween(start, end);
    }

    // FILTER BY RATING RANGE
    @GetMapping("/rating/{start}/{end}")
    public List<Product> findByRatingBetween(
            @PathVariable double start,
            @PathVariable double end) {

        return productService.findByRatingBetween(start, end);
    }

    // FILTER BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public List<Product> findByCategoryId(
            @PathVariable Long categoryId) {

        return productService.findByCategoryId(categoryId);
    }

    // GET PAGINATED PRODUCTS
    @GetMapping("/paged")
    public Page<Product> getProducts(Pageable pageable) {
        return productService.getProducts(pageable);
    }

    // SEARCH WITH OPTIONAL CATEGORY FILTER
    @GetMapping("/search")
    public Page<Product> searchProducts(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) Long categoryId,
            Pageable pageable) {

        return productService.searchProducts(
                keyword,
                categoryId,
                pageable);
    }

    // UPDATE PRODUCT IMAGE
    @PutMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product updateProductImage(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file)
            throws IOException {

        return productService.updateProductImage(id, file);
    }
}
