package com.ecommerce.api.dto;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CreateOrderRequest(
    @NotBlank @Size(max=100) String recipientName,
    @NotBlank @Email @Size(max=150) String email,
    @NotBlank @Pattern(regexp="^[6-9][0-9]{9}$") String phone,
    @NotBlank @Size(max=500) String address,
    @NotBlank @Size(max=100) String city,
    @NotBlank @Size(max=100) String state,
    @NotBlank @Pattern(regexp="^[0-9]{6}$") String postalCode,
    @NotBlank @Pattern(regexp="^(UPI|CARD|CASH_ON_DELIVERY)$") String paymentMethod,
    @NotEmpty List<@Valid OrderLineRequest> items
) {
    public record OrderLineRequest(@NotNull @Positive Integer productId, @NotNull @Positive Integer quantity) {}
}
