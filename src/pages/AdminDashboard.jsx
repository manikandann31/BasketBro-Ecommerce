import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
        <section className="admin-dashboard-page">
            <header className="admin-dashboard-header">
                <div>
                    <span className="admin-eyebrow">ADMINISTRATION</span>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Welcome back! Manage your store from one place.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-button admin-button-logout"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </header>

            <div className="admin-dashboard-grid">
                <article className="admin-dashboard-card">
                    <div className="admin-dashboard-card-icon">
                        📦
                    </div>

                    <h2>Manage Products</h2>

                    <p>
                        View your product inventory and update product
                        information or remove products from your store.
                    </p>

                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => navigate("/admin/products")}
                    >
                        Manage Products
                        <span aria-hidden="true"> →</span>
                    </button>
                </article>

                <article className="admin-dashboard-card">
                    <div className="admin-dashboard-card-icon">
                        ＋
                    </div>

                    <h2>Add a Product</h2>

                    <p>
                        Add a new product with its price, stock, category,
                        and product image.
                    </p>

                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => navigate("/admin/products/add")}
                    >
                        Add Product
                        <span aria-hidden="true"> →</span>
                    </button>
                </article>
            </div>

            <div className="admin-dashboard-notice">
                <span aria-hidden="true">ℹ️</span>
                <p>
                    Product changes affect the inventory displayed in your
                    store. Check product details and stock quantities before
                    saving updates.
                </p>
            </div>
        </section>
    );
}

export default AdminDashboard;