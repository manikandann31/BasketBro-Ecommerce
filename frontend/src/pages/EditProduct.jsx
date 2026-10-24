import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { getCategories } from "../services/categoryService";
import api from "../services/api";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState(null);

    const [categories, setCategories] = useState([]);

    const [product, setProduct] = useState({
        name: "",
        brand: "",
        price: "",
        rating: "",
        quantity: "",
        image: "",
        categoryId: ""
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

            const [productResponse, categoryResponse] =
                await Promise.all([
                    getProductById(id),
                    getCategories()
                ]);

            const existingProduct = productResponse.data;

            setCategories(categoryResponse.data);

            setProduct({
                name: existingProduct.name ?? "",
                brand: existingProduct.brand ?? "",
                price: existingProduct.price ?? "",
                rating: existingProduct.rating ?? "",
                quantity: existingProduct.quantity ?? "",
                image: existingProduct.image ?? "",
                categoryId: existingProduct.category?.id ?? ""
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load product details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProduct((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !product.name.trim() ||
            product.price === "" ||
            product.quantity === "" ||
            !product.categoryId
        ) {
            setError("Please complete all required fields.");
            return;
        }

        if (
            !Number.isFinite(Number(product.price)) ||
            Number(product.price) <= 0
        ) {
            setError("Price must be greater than zero.");
            return;
        }

        if (
            !Number.isInteger(Number(product.quantity)) ||
            Number(product.quantity) < 0
        ) {
            setError("Quantity must be a non-negative whole number.");
            return;
        }

        if (
            product.rating !== "" &&
            (
                !Number.isFinite(Number(product.rating)) ||
                Number(product.rating) < 0 ||
                Number(product.rating) > 5
            )
        ) {
            setError("Rating must be between 0 and 5.");
            return;
        }

        const payload = {
            name: product.name.trim(),
            brand: product.brand.trim(),
            price: Number(product.price),
            rating: product.rating === ""
                ? 0
                : Number(product.rating),
            quantity: Number(product.quantity),
            image: product.image.trim(),
            category: {
                id: Number(product.categoryId)
            }
        };

        try {
            setSaving(true);

            await api.put(`/products/${id}`, payload);

            if (imageFile) {
                const formData = new FormData();

                formData.append("file", imageFile);

                await api.put(`/products/${id}/image`, formData);
            }

            alert("Product updated successfully!");

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update product. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading product details...</p>;
    }

    if (error && !product.name) {
        return (
            <div className="admin-form-container">
                <p className="form-error">{error}</p>

                <button onClick={() => navigate("/admin/products")}>
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            <h1>Edit Product</h1>

            {error && <p className="form-error">{error}</p>}

            <form
                onSubmit={handleSubmit}
                className="admin-product-form"
            >
                <label>
                    Product Name *
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Brand
                    <input
                        type="text"
                        name="brand"
                        value={product.brand}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Price (₹) *
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                    />
                </label>

                <label>
                    Rating (0–5)
                    <input
                        type="number"
                        name="rating"
                        value={product.rating}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                    />
                </label>

                <label>
                    Quantity *
                    <input
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        required
                    />
                </label>

                <label>
                    Image Filename
                    <input
                        type="text"
                        name="image"
                        value={product.image}
                        onChange={handleChange}
                        placeholder="product-image.jpg"
                    />
                </label>

                <label>
                    Category *
                    <select
                        name="categoryId"
                        value={product.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Upload Product Image

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                            setImageFile(e.target.files?.[0] ?? null);
                        }}
                    />
                </label>

                <div className="form-buttons">
                    <button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Update Product"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;