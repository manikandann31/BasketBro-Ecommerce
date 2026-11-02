import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(item) {
    const uploaded = Array.isArray(item.images) && item.images.length
        ? (typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.imageUrl)
        : null;
    const value = uploaded || item.image;
    if (!value || typeof value !== "string") return "/product-placeholder.svg";
    const image = value.trim();
    if (/^(https?:)?\/\//i.test(image) || /^(data|blob):/i.test(image)) return image;
    if (image.startsWith("/")) return image.startsWith("/images/") ? `${API_ORIGIN}${image}` : image;
    return `${API_ORIGIN}/images/${encodeURIComponent(image)}`;
}

function Cart() {
    const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    const formatPrice = (price) => Number(price).toLocaleString("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 2
    });

    const proceedToCheckout = () => {
        if (!localStorage.getItem("customerToken")) {
            navigate("/customer/login?mode=login&returnTo=%2Fcheckout");
            return;
        }
        navigate("/checkout");
    };

    return (
        <div className="container cart-page">
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div><p>Your cart is empty.</p><Link to="/">Continue Shopping</Link></div>
            ) : (
                <>
                    <p>{cartCount} item(s) in your cart</p>
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.id}>
                                <img
                                    src={resolveImageUrl(item)}
                                    alt={item.name}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = "/product-placeholder.svg";
                                    }}
                                />
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p>{formatPrice(item.price)}</p>
                                    <label>Quantity:{" "}
                                        <select value={item.cartQuantity} onChange={(event) => {
                                            const result = updateQuantity(item.id, Number(event.target.value));
                                            if (!result.success) window.alert(result.message);
                                        }}>
                                            {Array.from({ length: Math.min(Math.max(Number(item.quantity) || 0, 1), 100) },
                                                (_, index) => index + 1
                                            ).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                                        </select>
                                    </label>
                                    <p>Subtotal: {formatPrice(Number(item.price) * item.cartQuantity)}</p>
                                    <button type="button" onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <p>Total: <strong>{formatPrice(cartTotal)}</strong></p>
                        <button type="button" onClick={proceedToCheckout}>Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
}
export default Cart;
