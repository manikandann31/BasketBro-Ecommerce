import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getProducts,
    deleteProduct
} from "../services/productService";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getProducts();

            setProducts(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.content ?? []
            );
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setError("Unable to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(product.id);
            setError("");

            await deleteProduct(product.id);

            setProducts((previousProducts) =>
                previousProducts.filter(
                    (item) => item.id !== product.id
                )
            );
        } catch (error) {
            console.error("Failed to delete product:", error);

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setError(
                    "You are not authorized to delete this product. Please log in again."
                );
            } else {
                setError("Failed to delete product. Please try again.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-products">
                <div className="admin-loading">
                    <div className="loading-spinner" />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="admin-products">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">INVENTORY MANAGEMENT</span>
                    <h1>Manage Products</h1>
                    <p className="admin-page-description">
                        View, edit, and manage your store inventory.
                    </p>
                </div>

                <div className="admin-header-actions">
                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => navigate("/admin/products/add")}
                    >
                        <span aria-hidden="true">＋</span>
                        Add Product
                    </button>

                    <button
                        type="button"
                        className="admin-button admin-button-secondary"
                        onClick={fetchProducts}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </header>

            {error && (
                <div role="alert" className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            <div className="admin-table-card">
                <div className="admin-table-heading">
                    <div>
                        <h2>Product Inventory</h2>
                        <p>
                            {products.length} product
                            {products.length === 1 ? "" : "s"} found
                        </p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="admin-empty-state">
                        <div className="admin-empty-icon">📦</div>
                        <h3>No products available</h3>
                        <p>Add a product to start managing your inventory.</p>

                        <button
                            type="button"
                            className="admin-button admin-button-primary"
                            onClick={() => navigate("/admin/products/add")}
                        >
                            Add your first product
                        </button>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="admin-product-id">
                                            #{product.id}
                                        </td>

                                        <td className="admin-product-name">
                                            {product.name}
                                        </td>

                                        <td>{product.brand || "—"}</td>

                                        <td className="admin-product-price">
                                            ₹
                                            {Number(product.price).toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`stock-badge ${product.quantity <= 5
                                                        ? "stock-low"
                                                        : "stock-available"
                                                    }`}
                                            >
                                                {product.quantity} units
                                            </span>
                                        </td>

                                        <td>
                                            {product.category?.name ?? "—"}
                                        </td>

                                        <td>
                                            <div className="admin-row-actions">
                                                <button
                                                    type="button"
                                                    className="admin-button admin-button-edit"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/products/edit/${product.id}`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-button admin-button-delete"
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                    disabled={
                                                        deletingId === product.id
                                                    }
                                                >
                                                    {deletingId === product.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminProducts;