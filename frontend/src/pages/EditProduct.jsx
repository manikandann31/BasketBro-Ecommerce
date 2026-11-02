import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { getCategories } from "../services/categoryService";
import api from "../services/api";

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState({
        name: "", brand: "", price: "", rating: "", quantity: "", image: "", categoryId: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError("");
            const [productResponse, categoryResponse] = await Promise.all([
                getProductById(id), getCategories()
            ]);
            const existing = productResponse.data;
            setCategories(categoryResponse.data);
            setExistingImages(existing.images || []);
            setProduct({
                name: existing.name ?? "",
                brand: existing.brand ?? "",
                price: existing.price ?? "",
                rating: existing.rating ?? "",
                quantity: existing.quantity ?? "",
                image: existing.image ?? "",
                categoryId: existing.category?.id ?? ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load product details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        setProduct(previous => ({ ...previous, [e.target.name]: e.target.value }));
    };

    const handleImagesChange = e => {
        const files = Array.from(e.target.files || []);
        setError("");
        if (existingImages.length + files.length > MAX_IMAGES) {
            setError(`This product can have up to 10 images. ${existingImages.length} already exist.`);
            e.target.value = "";
            return;
        }
        const invalid = files.find(file =>
            !ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE
        );
        if (invalid) {
            setError("Images must be JPG, PNG, WEBP or GIF and each must be 5 MB or smaller.");
            e.target.value = "";
            return;
        }
        setImageFiles(files);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");

        if (!product.name.trim() || product.price === "" || product.quantity === "" || !product.categoryId) {
            setError("Please complete all required fields.");
            return;
        }
        if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
            setError("Price must be greater than zero.");
            return;
        }
        if (!Number.isInteger(Number(product.quantity)) || Number(product.quantity) < 0) {
            setError("Quantity must be a non-negative whole number.");
            return;
        }
        if (product.rating !== "" &&
            (!Number.isFinite(Number(product.rating)) || Number(product.rating) < 0 || Number(product.rating) > 5)) {
            setError("Rating must be between 0 and 5.");
            return;
        }

        const payload = {
            name: product.name.trim(),
            brand: product.brand.trim(),
            price: Number(product.price),
            rating: product.rating === "" ? 0 : Number(product.rating),
            quantity: Number(product.quantity),
            image: product.image.trim(),
            category: { id: Number(product.categoryId) }
        };

        try {
            setSaving(true);
            await api.put(`/products/${id}`, payload);

            if (imageFiles.length) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append("files", file));
                await api.post(`/products/${id}/images`, formData);
            }

            alert("Product updated successfully!");
            navigate("/admin/products");
        } catch (err) {
            setError(err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response.data : null) ||
                "Failed to update product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading product details...</p>;
    if (error && !product.name) {
        return <div className="admin-form-container">
            <p className="form-error">{error}</p>
            <button onClick={() => navigate("/admin/products")}>Back to Products</button>
        </div>;
    }

    return (
        <div className="admin-form-container">
            <h1>Edit Product</h1>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit} className="admin-product-form">
                <label>Product Name *
                    <input type="text" name="name" value={product.name} onChange={handleChange} required />
                </label>
                <label>Brand
                    <input type="text" name="brand" value={product.brand} onChange={handleChange} />
                </label>
                <label>Price (₹) *
                    <input type="number" name="price" value={product.price} onChange={handleChange} min="0.01" step="0.01" required />
                </label>
                <label>Rating (0–5)
                    <input type="number" name="rating" value={product.rating} onChange={handleChange} min="0" max="5" step="0.1" />
                </label>
                <label>Quantity *
                    <input type="number" name="quantity" value={product.quantity} onChange={handleChange} min="0" step="1" required />
                </label>
                <label>Image Filename (legacy field)
                    <input type="text" name="image" value={product.image} onChange={handleChange} placeholder="product-image.jpg" />
                </label>
                <label>Category *
                    <select name="categoryId" value={product.categoryId} onChange={handleChange} required>
                        <option value="">Select a category</option>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </label>
                <div>
                    <p>Existing images: {existingImages.length}/{MAX_IMAGES}</p>
                    {existingImages.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {existingImages.map((image, index) => (
                            <img key={image.id ?? index} src={image.imageUrl} alt={`Product ${index + 1}`}
                                style={{ width: 90, height: 90, objectFit: "contain", border: "1px solid #ddd", borderRadius: 8 }} />
                        ))}
                    </div>}
                </div>
                <label>Add More Images (JPG, PNG, WEBP or GIF; max 5 MB each)
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple
                        disabled={existingImages.length >= MAX_IMAGES}
                        onChange={handleImagesChange} />
                </label>
                {imageFiles.length > 0 && <p>{imageFiles.length} new image(s) selected: {imageFiles.map(file => file.name).join(", ")}</p>}
                <div className="form-buttons">
                    <button type="submit" disabled={saving}>{saving ? "Updating..." : "Update Product"}</button>
                    <button type="button" disabled={saving} onClick={() => navigate("/admin/products")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;
