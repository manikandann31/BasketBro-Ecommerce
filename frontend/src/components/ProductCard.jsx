import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(value) {
    if (!value || typeof value !== "string") return "/product-placeholder.svg";
    const image = value.trim();
    if (/^(https?:)?\/\//i.test(image) || /^(data|blob):/i.test(image)) return image;
    if (image.startsWith("/")) {
        return image.startsWith("/images/") ? `${API_ORIGIN}${image}` : image;
    }
    // Legacy records store only a filename; newer production records should store
    // the complete Cloudinary URL, which is returned unchanged above.
    return `${API_ORIGIN}/images/${encodeURIComponent(image)}`;
}

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [message, setMessage] = useState("");
    const firstUploadedImage = Array.isArray(product.images) && product.images.length
        ? (typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.imageUrl)
        : null;
    const imageUrl = resolveImageUrl(firstUploadedImage || product.image);

    const handleAddToCart = () => {
        const result = addToCart(product, 1);
        setMessage(result.message);
        if (result.success) setTimeout(() => setMessage(""), 2000);
    };

    const stock = Number(product.quantity) || 0;

    return (
        <div className="product-card">
            <div className="product-image">
                <img src={imageUrl} alt={product.name}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/product-placeholder.svg";
                    }} />
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.brand}</p>
                <p>₹{Number(product.price).toLocaleString("en-IN")}</p>
                <p>⭐ {product.rating}</p>
                <p>{product.category?.name}</p>
                <p>{stock > 0 ? `In stock: ${stock}` : "Out of stock"}</p>
                <Link to={`/products/${product.id}`}>View Details</Link>
                <button type="button" onClick={handleAddToCart} disabled={stock <= 0}>
                    {stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                {message && <p role="status" aria-live="polite">{message}</p>}
            </div>
        </div>
    );
}

export default ProductCard;
