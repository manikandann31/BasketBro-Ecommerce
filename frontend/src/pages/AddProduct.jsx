import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getCategories } from "../services/categoryService";

function AddProduct() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [product, setProduct] = useState({
        name: "",
        brand: "",
        price: "",
        rating: "",
        quantity: "",
        categoryId: ""
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(imageFile);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [imageFile]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (err) {
            setError("Failed to load categories.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProduct((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] ?? null;

        setError("");

        if (!file) {
            setImageFile(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Please select a JPG, PNG, WEBP, or GIF image.");
            e.target.value = "";
            setImageFile(null);
            return;
        }

        setImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !product.name.trim() ||
            !product.price ||
            product.quantity === "" ||
            !product.categoryId
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (Number(product.price) <= 0 || Number(product.quantity) < 0) {
            setError(
                "Price must be positive and quantity cannot be negative."
            );
            return;
        }

        if (
            product.rating !== "" &&
            (Number(product.rating) < 0 || Number(product.rating) > 5)
        ) {
            setError("Rating must be between 0 and 5.");
            return;
        }

        const payload = {
            name: product.name.trim(),
            brand: product.brand.trim(),
            price: Number(product.price),
            rating: product.rating === "" ? 0 : Number(product.rating),
            quantity: Number(product.quantity),
            image: "",
            category: {
                id: Number(product.categoryId)
            }
        };

        try {
            setLoading(true);

            // Step 1: Create the product.
            const response = await api.post("/products", payload);

            const createdProduct = response.data;

            // Step 2: Upload the image if one was selected.
            if (imageFile) {
                if (!createdProduct?.id) {
                    throw new Error(
                        "Product was created, but its ID was not returned. " +
                        "Please check the product before trying again."
                    );
                }

                const formData = new FormData();
                formData.append("file", imageFile);

                await api.put(
                    `/products/${createdProduct.id}/image`,
                    formData
                );
            }

            alert(
                imageFile
                    ? "Product and image added successfully!"
                    : "Product added successfully!"
            );

            navigate("/admin/products");
        } catch (err) {
            console.error("Add product error:", err);

            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : null) ||
                err.message ||
                "Failed to add product. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container">
            <h1>Add New Product</h1>

            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleSubmit} className="admin-product-form">
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
                    Product Image
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                    />
                </label>

                {imagePreview && (
                    <div className="image-preview">
                        <p>Image Preview</p>
                        <img
                            src={imagePreview}
                            alt="Selected product preview"
                            style={{
                                width: "180px",
                                height: "180px",
                                objectFit: "contain",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "8px"
                            }}
                        />
                    </div>
                )}

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

                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Adding Product..."
                            : "Add Product"}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => navigate("/admin/products")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddProduct;