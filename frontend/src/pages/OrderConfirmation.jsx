import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api";

function OrderConfirmation() {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order?.orderId === orderId ? location.state.order : null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState("");

    useEffect(() => {
        if (location.state?.order?.orderId === orderId) { setOrder(location.state.order); setLoading(false); return; }
        let active = true;
        api.get(`/orders/${encodeURIComponent(orderId)}`).then(({data}) => {
            if (!active) return;
            setOrder({
                orderId:data.orderId, createdAt:data.createdAt, paymentMethod:data.paymentMethod,
                paymentStatus:data.paymentStatus, orderStatus:data.orderStatus,
                customer:{customerName:data.customerName,email:data.email,phone:data.phone,address:data.address,
                    city:data.city,state:data.state,postalCode:data.postalCode},
                items:data.items.map(item=>({productId:item.productId,name:item.name,price:item.price,quantity:item.quantity,subtotal:item.subtotal})),
                total:data.total
            });
        }).catch(err => { if(active) setError(err.response?.data?.message || err.response?.data?.detail || "Unable to load this order."); })
          .finally(()=>{if(active)setLoading(false);});
        return ()=>{active=false;};
    }, [orderId, location.state]);

    const money = value => Number(value || 0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
    const downloadReceipt = () => {
        if (!order) return;
        const safe = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const rows = order.items.map(item=>`<tr><td>${safe(item.name)}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.subtotal)}</td></tr>`).join("");
        const c=order.customer;
        const html=`<!doctype html><html><head><meta charset="utf-8"><title>BasketBro Receipt ${safe(order.orderId)}</title>
        <style>body{font:15px Arial;color:#172033;max-width:850px;margin:40px auto;padding:24px}h1{color:#2563eb}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:12px;border:1px solid #dbe2ea;text-align:left}th{background:#eff6ff}.total{text-align:right;font-size:20px;font-weight:bold}</style></head><body>
        <h1>BasketBro</h1><h2>Order Receipt</h2><p><b>Order ID:</b> ${safe(order.orderId)}<br><b>Order Date:</b> ${safe(new Date(order.createdAt).toLocaleString("en-IN"))}</p>
        <h3>Customer details</h3><p>${safe(c.customerName)}<br>${safe(c.email)}<br>${safe(c.phone)}</p><h3>Delivery address</h3><p>${safe(c.address)}<br>${safe(c.city)}, ${safe(c.state)} - ${safe(c.postalCode)}</p>
        <table><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
        <p><b>Payment:</b> ${safe(order.paymentMethod)} · ${safe(order.paymentStatus)}<br><b>Order status:</b> ${safe(order.orderStatus)}</p><p class="total">Grand Total: ${money(order.total)}</p>
        <p>This is a demo receipt, not a tax invoice or proof of real payment.</p></body></html>`;
        const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));
        const a=document.createElement("a");a.href=url;a.download=`BasketBro-Receipt-${order.orderId}.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };

    if(loading) return <div className="container order-confirmation-page"><p>Loading order details…</p></div>;
    if(error || !order) return <div className="container order-confirmation-page"><h1>Order details unavailable</h1><p>{error || "This order could not be found."}</p><Link to="/my-orders">Back to My Orders</Link></div>;
    const c=order.customer;
    return <div className="container order-confirmation-page">
        <div className="order-success-icon" aria-hidden="true">✓</div><p className="checkout-step-label">BASKETBRO ORDER</p>
        <h1>{order.orderStatus === "CANCELLED" ? "Order cancelled" : "Order details"}</h1>
        <div className="order-receipt-card">
            <div className="order-receipt-heading"><div><span>Order ID</span><strong>{order.orderId}</strong></div><span className="order-status-badge">{order.orderStatus}</span></div>
            <p className="order-date">{new Date(order.createdAt).toLocaleString("en-IN")}</p><h2>Products</h2>
            <div className="order-product-list">{order.items.map((item,index)=><div className="order-product-row" key={item.productId ?? index}>
                <div><strong>{item.name}</strong><span>Quantity: {item.quantity} × {money(item.price)}</span></div><strong>{money(item.subtotal)}</strong></div>)}</div>
            <div className="order-total-row"><span>Total</span><strong>{money(order.total)}</strong></div>
            <h2>Customer details</h2><p><strong>{c.customerName}</strong><br/>{c.email}<br/>{c.phone}</p>
            <h2>Delivery address</h2><p>{c.address}, {c.city}, {c.state} - {c.postalCode}</p>
            <p><strong>Payment:</strong> {order.paymentMethod} · {order.paymentStatus}</p>
            <button type="button" className="receipt-download-button" onClick={downloadReceipt}>⬇ Download Order Receipt</button>
        </div>
        <Link className="continue-shopping-link" to="/my-orders">Back to My Orders</Link>
        <Link className="continue-shopping-link" to="/">Continue Shopping</Link>
    </div>;
}
export default OrderConfirmation;
