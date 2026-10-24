
package com.ecommerce.api.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	// PRODUCT NOT FOUND
	@ExceptionHandler(ProductNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleProductNotFound(ProductNotFoundException ex) {

		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("error", "PRODUCT_NOT_FOUND", "message", ex.getMessage()));
	}

	// INVALID INPUT OR BUSINESS RULE VIOLATION
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {

		return ResponseEntity.badRequest().body(Map.of("error", "INVALID_REQUEST", "message", ex.getMessage()));
	}

	// INVALID JSON REQUEST BODY
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, String>> handleInvalidJson(HttpMessageNotReadableException ex) {

		return ResponseEntity.badRequest().body(
				Map.of("error", "INVALID_JSON", "message", "The request body is missing or contains invalid JSON."));
	}

	// INVALID PATH OR QUERY PARAMETER TYPE
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {

		return ResponseEntity.badRequest().body(Map.of("error", "INVALID_PARAMETER", "message",
				"Invalid value supplied for parameter: " + ex.getName()));
	}
}
