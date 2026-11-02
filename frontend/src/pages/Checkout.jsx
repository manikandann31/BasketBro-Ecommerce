import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Checkout() {
    const { cartItems, cartCount, cartTotal } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: localStorage.getItem("customerName") || "",
        email: localStorage.getItem("customerEmail") || "",
        phone: "", address: "", city: "", state: "", postalCode: ""
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!localStorage.getItem("customerToken")) {
            navigate("/customer/login?mode=login&returnTo=%2Fcheckout", { replace: true });
        }
    }, [navigate]);

    const formatPrice = (price) => Number(price).toLocaleString("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: "" }));
    };

    const validateForm = () => {
        const next = {};
        if (!formData.customerName.trim()) next.customerName = "Please enter your full name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = "Enter a valid email address.";
        if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) next.phone = "Enter a valid 10-digit Indian mobile number.";
        if (!formData.address.trim()) next.address = "Please enter your shipping address.";
        if (!formData.city.trim()) next.city = "Please enter your city.";
        if (!formData.state.trim()) next.state = "Please enter your state.";
        if (!/^\d{6}$/.test(formData.postalCode.trim())) next.postalCode = "Enter a valid 6-digit PIN code.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!cartItems.length || !validateForm()) return;
        const customer = {
            ...formData,
            customerName: formData.customerName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            postalCode: formData.postalCode.trim()
        };
        sessionStorage.setItem("basketbroCheckoutCustomer", JSON.stringify(customer));
        navigate("/payment");
    };

    if (!localStorage.getItem("customerToken")) return null;
    if (!cartItems.length) return <div className="container"><h1>Checkout</h1><p>Your cart is empty.</p><Link to="/">Continue Shopping</Link></div>;

    const fields = [
        { name: "customerName", label: "Full Name", auto: "name" },
        { name: "email", label: "Email Address", type: "email", auto: "email" },
        { name: "phone", label: "Mobile Number", type: "tel", auto: "tel", max: 10 },
        { name: "address", label: "Shipping Address", multiline: true, auto: "street-address" },
        { name: "city", label: "City", auto: "address-level2" },
        { name: "state", label: "State", auto: "address-level1" },
        { name: "postalCode", label: "PIN Code", auto: "postal-code", max: 6 }
    ];

    return (
        <div className="container checkout-page">
            <h1>Checkout</h1>
            <div className="checkout-layout">
                <form onSubmit={handleSubmit} noValidate>
                    <section className="checkout-section">
                        <h2>Customer & Shipping Details</h2>
                        {fields.map((field) => (
                            <div className="form-group" key={field.name}>
                                <label htmlFor={field.name}>{field.label}</label>
                                {field.multiline ? (
                                    <textarea id={field.name} name={field.name} value={formData[field.name]} onChange={handleChange} rows={3} autoComplete={field.auto} />
                                ) : (
                                    <input id={field.name} name={field.name} type={field.type || "text"} value={formData[field.name]} onChange={handleChange} autoComplete={field.auto} maxLength={field.max} inputMode={field.name === "phone" || field.name === "postalCode" ? "numeric" : undefined} />
                                )}
                                {errors[field.name] && <p className="form-error">{errors[field.name]}</p>}
                            </div>
                        ))}
                    </section>
                    <button type="submit" className="checkout-button">Continue to Payment</button>
                </form>
                <aside className="checkout-summary">
                    <h2>Order Summary</h2>
                    {cartItems.map((item) => (
                        <div className="checkout-summary-item" key={item.id}>
                            <div><strong>{item.name}</strong><p>Quantity: {item.cartQuantity}</p></div>
                            <span>{formatPrice(Number(item.price) * item.cartQuantity)}</span>
                        </div>
                    ))}
                    <hr />
                    <p>Total items: <strong>{cartCount}</strong></p>
                    <h3>Total: {formatPrice(cartTotal)}</h3>
                    <Link to="/cart">Back to Cart</Link>
                </aside>
            </div>
        </div>
    );
}
export default Checkout;