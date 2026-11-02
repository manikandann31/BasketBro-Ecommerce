import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Payment() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const customer = useMemo(() => {
        try { return JSON.parse(sessionStorage.getItem("basketbroCheckoutCustomer") || "null"); }
        catch { return null; }
    }, []);
    const [method, setMethod] = useState("UPI");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const formatPrice = price => Number(price).toLocaleString("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    });

    const confirmPayment = async () => {
        if (!customer || !cartItems.length || processing) return;
        setProcessing(true); setError("");
        try {
            const payload = {
                recipientName: customer.customerName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                state: customer.state,
                postalCode: customer.postalCode,
                paymentMethod: method,
                items: cartItems.map(item => ({
                    productId: Number(item.id),
                    quantity: Number(item.cartQuantity)
                }))
            };
            const { data } = await api.post("/orders", payload);
            sessionStorage.removeItem("basketbroCheckoutCustomer");
            clearCart();
            const order = {
                orderId: data.orderId,
                createdAt: data.createdAt,
                paymentMethod: data.paymentMethod,
                paymentStatus: data.paymentStatus,
                orderStatus: data.orderStatus,
                customer: {
                    customerName: data.customerName, email: data.email, phone: data.phone,
                    address: data.address, city: data.city, state: data.state, postalCode: data.postalCode
                },
                items: data.items.map(item => ({
                    productId: item.productId, name: item.name, price: item.price,
                    quantity: item.quantity, subtotal: item.subtotal
                })),
                total: data.total
            };
            navigate(`/order-confirmation/${encodeURIComponent(order.orderId)}`, { replace: true, state: { order } });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || "Unable to place your order. Please check stock and try again.");
            setProcessing(false);
        }
    };

    if (!customer) return <div className="container payment-page"><h1>Checkout details not found</h1>
        <p>Please enter your delivery details before continuing.</p><Link to="/checkout">Return to checkout</Link></div>;
    if (!cartItems.length) return <div className="container payment-page"><h1>Your cart is empty</h1><Link to="/">Continue shopping</Link></div>;

    return <div className="container payment-page">
        <p className="checkout-step-label">BASKETBRO CHECKOUT · DEMO PAYMENT</p><h1>Choose Payment Method</h1>
        <div className="payment-layout">
            <section className="checkout-section payment-methods"><h2>Payment options</h2>
                {[
                    { value: "UPI", label: "UPI (simulation)", note: "Demo payment only — no money will be charged." },
                    { value: "CARD", label: "Credit / Debit Card (simulation)", note: "No real card details are collected." },
                    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", note: "Pay when your order is delivered." }
                ].map(option => <label className={`payment-option ${method === option.value ? "selected" : ""}`} key={option.value}>
                    <input type="radio" name="paymentMethod" value={option.value} checked={method === option.value} onChange={() => setMethod(option.value)} />
                    <span><strong>{option.label}</strong><small>{option.note}</small></span>
                </label>)}
                {error && <p className="form-error">{error}</p>}
                <button type="button" className="checkout-button" disabled={processing} onClick={confirmPayment}>
                    {processing ? "Placing order…" : method === "CASH_ON_DELIVERY" ? "Place Order" : "Simulate Payment & Place Order"}
                </button>
                <p className="payment-disclaimer">Demo only. No real payment gateway or payment processing is connected.</p>
            </section>
            <aside className="checkout-summary"><h2>Delivery to</h2><strong>{customer.customerName}</strong>
                <p>{customer.email}<br />{customer.phone}</p>
                <p>{customer.address}, {customer.city}, {customer.state} - {customer.postalCode}</p><hr />
                <h2>Order Total</h2>
                {cartItems.map(item => <div className="checkout-summary-item" key={item.id}>
                    <div><strong>{item.name}</strong><p>Qty: {item.cartQuantity}</p></div>
                    <span>{formatPrice(Number(item.price) * item.cartQuantity)}</span>
                </div>)}
                <h3>{formatPrice(cartTotal)}</h3><Link to="/checkout">Edit delivery details</Link>
            </aside>
        </div>
    </div>;
}
export default Payment;
