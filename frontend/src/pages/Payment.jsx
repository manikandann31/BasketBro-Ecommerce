import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

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

    const formatPrice = (price) => Number(price).toLocaleString("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    });

    const confirmPayment = () => {
        if (!customer || !cartItems.length || processing) return;
        setProcessing(true);
        setError("");
        try {
            const orderId = `BB${Date.now().toString().slice(-10)}`;
            const order = {
                orderId,
                createdAt: new Date().toISOString(),
                paymentMethod: method,
                paymentStatus: method === "CASH_ON_DELIVERY" ? "PAY ON DELIVERY" : "SIMULATED SUCCESS",
                orderStatus: "CONFIRMED",
                customer,
                items: cartItems.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.cartQuantity),
                    subtotal: Number(item.price) * Number(item.cartQuantity)
                })),
                total: cartTotal
            };
            const orders = JSON.parse(localStorage.getItem("basketbroOrders") || "[]");
            localStorage.setItem("basketbroOrders", JSON.stringify([order, ...orders]));
            sessionStorage.removeItem("basketbroCheckoutCustomer");
            clearCart();
            navigate(`/order-confirmation/${orderId}`, { replace: true, state: { order } });
        } catch {
            setError("Unable to create your demo order. Please try again.");
            setProcessing(false);
        }
    };

    if (!customer) return (
        <div className="container payment-page">
            <h1>Checkout details not found</h1>
            <p>Please enter your delivery details before continuing.</p>
            <Link to="/checkout">Return to checkout</Link>
        </div>
    );
    if (!cartItems.length) return (
        <div className="container payment-page">
            <h1>Your cart is empty</h1><Link to="/">Continue shopping</Link>
        </div>
    );

    return (
        <div className="container payment-page">
            <p className="checkout-step-label">BASKETBRO SECURE CHECKOUT · DEMO</p>
            <h1>Choose Payment Method</h1>
            <div className="payment-layout">
                <section className="checkout-section payment-methods">
                    <h2>Payment options</h2>
                    {[
                        { value: "UPI", label: "UPI (simulation)", note: "Demo payment only — no money will be charged." },
                        { value: "CARD", label: "Credit / Debit Card (simulation)", note: "No real card details are collected." },
                        { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", note: "Pay when your order is delivered." }
                    ].map((option) => (
                        <label className={`payment-option ${method === option.value ? "selected" : ""}`} key={option.value}>
                            <input type="radio" name="paymentMethod" value={option.value} checked={method === option.value} onChange={() => setMethod(option.value)} />
                            <span><strong>{option.label}</strong><small>{option.note}</small></span>
                        </label>
                    ))}
                    {error && <p className="form-error">{error}</p>}
                    <button type="button" className="checkout-button" disabled={processing} onClick={confirmPayment}>
                        {processing ? "Confirming order…" : method === "CASH_ON_DELIVERY" ? "Place Order" : "Simulate Payment & Place Order"}
                    </button>
                    <p className="payment-disclaimer">This is a portfolio demonstration. It does not connect to a payment gateway or process real payments.</p>
                </section>
                <aside className="checkout-summary">
                    <h2>Delivery to</h2>
                    <strong>{customer.customerName}</strong>
                    <p>{customer.email}<br />{customer.phone}</p>
                    <p>{customer.address}, {customer.city}, {customer.state} - {customer.postalCode}</p>
                    <hr />
                    <h2>Order Total</h2>
                    {cartItems.map((item) => (
                        <div className="checkout-summary-item" key={item.id}>
                            <div><strong>{item.name}</strong><p>Qty: {item.cartQuantity}</p></div>
                            <span>{formatPrice(Number(item.price) * item.cartQuantity)}</span>
                        </div>
                    ))}
                    <h3>{formatPrice(cartTotal)}</h3>
                    <Link to="/checkout">Edit delivery details</Link>
                </aside>
            </div>
        </div>
    );
}
export default Payment;