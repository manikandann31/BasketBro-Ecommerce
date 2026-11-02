import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function MyOrders() {
    const email = (localStorage.getItem("customerEmail") || "").trim().toLowerCase();
    const orders = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("basketbroOrders") || "[]")
                .filter(order => (order.customer?.email || "").trim().toLowerCase() === email)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch { return []; }
    }, [email]);
    const money = value => Number(value || 0).toLocaleString("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    });

    if (!localStorage.getItem("customerToken")) return <section className="container my-orders-page">
        <h1>My Orders</h1><p>Please sign in to view your orders.</p>
        <Link className="primary-button" to="/customer/login?mode=login&returnTo=%2Fmy-orders">Sign in</Link>
    </section>;

    return <section className="container my-orders-page">
        <div className="my-orders-header"><div><p className="checkout-step-label">YOUR BASKETBRO ACCOUNT</p>
            <h1>My Orders</h1><p>Review your purchases and order details.</p></div><Link to="/">Continue shopping</Link></div>
        {orders.length === 0 ? <div className="my-orders-empty"><h2>No orders yet</h2>
            <p>Your confirmed orders will appear here.</p><Link className="primary-button" to="/">Explore products</Link></div>
        : <div className="my-orders-list">{orders.map(order => <article className="my-order-card" key={order.orderId}>
            <div className="my-order-heading"><div><span>ORDER ID</span><strong>{order.orderId}</strong></div>
                <span className="order-status-badge">{order.orderStatus}</span></div>
            <p className="order-date">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
            <div className="my-order-items">{(order.items || []).map((item, index) => <div key={item.productId ?? index}>
                <span>{item.name} × {item.quantity}</span><strong>{money(item.subtotal)}</strong></div>)}</div>
            <div className="my-order-footer"><div><span>{order.paymentMethod} · {order.paymentStatus}</span>
                <strong>{money(order.total)}</strong></div>
                <Link className="admin-button admin-button-secondary" to={`/order-confirmation/${encodeURIComponent(order.orderId)}`}>View order details</Link></div>
        </article>)}</div>}
        <p className="my-orders-note">Demo order history is saved in this browser.</p>
    </section>;
}
