package com.ecommerce.api.exception;

public class ProductNotFoundException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = -6781546040726656075L;

	public ProductNotFoundException(String message) {
        super(message);
    }
}