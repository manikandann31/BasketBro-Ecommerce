import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const {
        cartItems,
        cartCount,
        cartTotal,
        updateQuantity,
        removeFromCart
    } = useCart();

    const navigate = useNavigate();

    const formatPrice = (price) =>
        Number(price).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });

    return (
        <div className="container cart-page">
            <h1>Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div>
                    <p>Your cart is empty.</p>

                    <Link to="/">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <p>
                        {cartCount} item(s) in your cart
                    </p>

                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.id}>
                                <img
                                    src={
                                        item.image
                                            ? `${(
                                                import.meta.env.VITE_API_BASE_URL ||
                                                "http://localhost:8080/api"
                                            ).replace(/\/api\/?$/, "")}/images/${item.image}`
                                            : "/product-placeholder.svg"
                                    }
                                    alt={item.name}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src =
                                            "/product-placeholder.svg";
                                    }}
                                    style={{
                                        width: "120px",
                                        height: "100px",
                                        objectFit: "contain"
                                    }}
                                />

                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>

                                    <p>{formatPrice(item.price)}</p>

                                    <label>
                                        Quantity:{" "}
                                        <select
                                            value={item.cartQuantity}
                                            onChange={(event) => {
                                                const result = updateQuantity(
                                                    item.id,
                                                    Number(event.target.value)
                                                );

                                                if (!result.success) {
                                                    window.alert(result.message);
                                                }
                                            }}
                                        >
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        Math.max(
                                                            Number(item.quantity) || 0,
                                                            1
                                                        ),
                                                        100
                                                    )
                                                },
                                                (_, index) => index + 1
                                            ).map((quantity) => (
                                                <option
                                                    key={quantity}
                                                    value={quantity}
                                                >
                                                    {quantity}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <p>
                                        Subtotal:{" "}
                                        {formatPrice(
                                            Number(item.price) *
                                            item.cartQuantity
                                        )}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromCart(item.id)
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <p>
                            Total: <strong>{formatPrice(cartTotal)}</strong>
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;