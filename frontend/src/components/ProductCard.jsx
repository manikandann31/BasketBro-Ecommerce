import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {

    const { addToCart } = useCart();
    const [message, setMessage] = useState("");

    // Backend API base URL
    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

    // Construct product image URL
    const imageUrl = product.image
        ? `${API_BASE_URL.replace(/\/api\/?$/, "")}/images/${product.image}`
        : "/product-placeholder.svg";

    const handleAddToCart = () => {
        const result = addToCart(product, 1);
        setMessage(result.message);

        if (result.success) {
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const stock = Number(product.quantity) || 0;

    return (
        <div className="product-card">

            <div className="product-image">
                <img
                    src={imageUrl}
                    alt={product.name}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/product-placeholder.svg";
                    }}
                />
            </div>

            <div className="product-info">

                <h3>{product.name}</h3>

                <p>{product.brand}</p>

                <p>
                    ₹{Number(product.price).toLocaleString("en-IN")}
                </p>

                <p>⭐ {product.rating}</p>

                <p>{product.category?.name}</p>

                <p>
                    {stock > 0
                        ? `In stock: ${stock}`
                        : "Out of stock"}
                </p>

                <Link to={`/products/${product.id}`}>
                    View Details
                </Link>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={stock <= 0}
                >
                    {stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                {message && (
                    <p role="status" aria-live="polite">
                        {message}
                    </p>
                )}

            </div>
        </div>
    );
}

export default ProductCard;