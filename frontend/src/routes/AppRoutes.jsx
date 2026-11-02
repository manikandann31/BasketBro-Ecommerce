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
import MyOrders from "../pages/MyOrders";
import AdminOrders from "../pages/AdminOrders";
import CustomerAuth from "../pages/CustomerAuth";
import SupportCenter from "../pages/SupportCenter";
import AdminSupport from "../pages/AdminSupport";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/my-orders" element={<MyOrders />} />

            <Route path="/customer/login" element={<CustomerAuth />} />
            <Route path="/support" element={<SupportCenter />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/admin/support" element={<ProtectedRoute><AdminSupport /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;