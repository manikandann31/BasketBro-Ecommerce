
import { Routes, Route, Navigate } from "react-router-dom";

import AdminProducts from "../pages/AdminProducts";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";

import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Payment from "../pages/Payment";
import OrderConfirmation from "../pages/OrderConfirmation";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            {/* Customer routes */}
            <Route path="/" element={<Home />} />

            <Route
                path="/products/:id"
                element={<ProductDetails />}
            />

            <Route path="/cart" element={<Cart />} />

            <Route path="/checkout" element={<Checkout />} />

            <Route path="/payment" element={<Payment />} />

            <Route
                path="/order-confirmation/:orderId"
                element={<OrderConfirmation />}
            />

            {/* Admin authentication */}
            <Route
                path="/admin/login"
                element={<AdminLogin />}
            />

            {/* Protected admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/products"
                element={
                    <ProtectedRoute>
                        <AdminProducts />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/products/add"
                element={
                    <ProtectedRoute>
                        <AddProduct />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/products/edit/:id"
                element={
                    <ProtectedRoute>
                        <EditProduct />
                    </ProtectedRoute>
                }
            />

            {/* Unknown routes */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;

