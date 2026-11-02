import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(value) {
    if (!value || typeof value !== "string") return null;
    const image = value.trim();
    if (/^(https?:)?\/\//i.test(image) || /^(data|blob):/i.test(image)) return image;
    if (image.startsWith("/")) {
        return image.startsWith("/images/") ? `${API_ORIGIN}${image}` : image;
    }
    // Backward compatibility for older rows containing only a local filename.
    return `${API_ORIGIN}/images/${encodeURIComponent(image)}`;
}

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getProductById(id);
                setProduct(response.data);
                setSelectedImage(0);
            } catch (err) {
                console.error("Failed to load product:", err);
                setError("Failed to load product.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const images = useMemo(() => {
        const uploaded = (product?.images || [])
            .map(item => resolveImageUrl(typeof item === "string" ? item : item?.imageUrl))
            .filter(Boolean);
        if (uploaded.length) return uploaded;
        const legacyImage = resolveImageUrl(product?.image);
        return legacyImage ? [legacyImage] : [];
    }, [product]);

    if (loading) return <h2>Loading product...</h2>;
    if (error) return <h2>{error}</h2>;
    if (!product) return <h2>Product not found.</h2>;

    const activeImage = images[selectedImage] || images[0];

    return (
        <main style={{ maxWidth: 1100, margin: "32px auto", padding: "0 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 36, alignItems: "start" }}>
                <section>
                    <div style={{ minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                        {activeImage ? (
                            <img src={activeImage} alt={product.name}
                                style={{ width: "100%", height: 340, objectFit: "contain" }}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = "/product-placeholder.svg";
                                }} />
                        ) : (
                            <div style={{ color: "#777", fontSize: 18 }}>No product image available</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                            {images.map((image, index) => (
                                <button key={index} type="button" onClick={() => setSelectedImage(index)}
                                    aria-label={`View product image ${index + 1}`}
                                    style={{ padding: 4, border: selectedImage === index ? "2px solid #2563eb" : "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
                                    <img src={image} alt={`Product thumbnail ${index + 1}`}
                                        style={{ width: 68, height: 68, objectFit: "contain", display: "block" }} />
                                </button>
                            ))}
                        </div>
                    )}
                </section>
                <section>
                    <h1 style={{ marginTop: 0 }}>{product.name}</h1>
                    <p>Brand: {product.brand || "—"}</p>
                    <h2 style={{ color: "#b12704" }}>₹{Number(product.price).toLocaleString("en-IN")}</h2>
                    <p>Rating: ⭐ {product.rating ?? "Not rated"}</p>
                    <p>Quantity available: {product.quantity}</p>
                    <p>Category: {product.category?.name || "—"}</p>
                </section>
            </div>
        </main>
    );
}

export default ProductDetails;
