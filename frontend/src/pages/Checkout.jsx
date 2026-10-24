import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Checkout() {
    const { cartItems, cartCount, cartTotal } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: ""
    });

    const [errors, setErrors] = useState({});

    const formatPrice = (price) =>
        Number(price).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Please enter your full name.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Please enter your shipping address.";
        }

        if (!formData.city.trim()) {
            newErrors.city = "Please enter your city.";
        }

        if (!formData.state.trim()) {
            newErrors.state = "Please enter your state.";
        }

        if (!/^\d{6}$/.test(formData.postalCode.trim())) {
            newErrors.postalCode = "Enter a valid 6-digit PIN code.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (cartItems.length === 0) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        // Temporary navigation until backend order creation is implemented.
        navigate("/payment", {
            state: {
                customer: {
                    ...formData,
                    customerName: formData.customerName.trim(),
                    email: formData.email.trim()
                }
            }
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="container">
                <h1>Checkout</h1>
                <p>Your cart is empty.</p>
                <Link to="/">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-layout">
                <form onSubmit={handleSubmit} noValidate>
                    <section className="checkout-section">
                        <h2>Customer Information</h2>

                        <div className="form-group">
                            <label htmlFor="customerName">Full Name</label>
                            <input
                                id="customerName"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                            {errors.customerName && (
                                <p className="form-error">
                                    {errors.customerName}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="form-error">{errors.email}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Mobile Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                inputMode="numeric"
                                maxLength={10}
                                autoComplete="tel"
                            />
                            {errors.phone && (
                                <p className="form-error">{errors.phone}</p>
                            )}
                        </div>
                    </section>

                    <section className="checkout-section">
                        <h2>Shipping Address</h2>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                autoComplete="street-address"
                            />
                            {errors.address && (
                                <p className="form-error">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                autoComplete="address-level2"
                            />
                            {errors.city && (
                                <p className="form-error">{errors.city}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                autoComplete="address-level1"
                            />
                            {errors.state && (
                                <p className="form-error">{errors.state}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="postalCode">PIN Code</label>
                            <input
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                inputMode="numeric"
                                maxLength={6}
                                autoComplete="postal-code"
                            />
                            {errors.postalCode && (
                                <p className="form-error">
                                    {errors.postalCode}
                                </p>
                            )}
                        </div>
                    </section>

                    <button type="submit" className="checkout-button">
                        Continue to Payment
                    </button>
                </form>

                <aside className="checkout-summary">
                    <h2>Order Summary</h2>

                    {cartItems.map((item) => (
                        <div className="checkout-summary-item" key={item.id}>
                            <div>
                                <strong>{item.name}</strong>
                                <p>Quantity: {item.cartQuantity}</p>
                            </div>

                            <span>
                                {formatPrice(
                                    Number(item.price) * item.cartQuantity
                                )}
                            </span>
                        </div>
                    ))}

                    <hr />

                    <p>
                        Total items: <strong>{cartCount}</strong>
                    </p>

                    <h3>Total: {formatPrice(cartTotal)}</h3>

                    <Link to="/cart">Back to Cart</Link>
                </aside>
            </div>
        </div>
    );
}

export default Checkout;