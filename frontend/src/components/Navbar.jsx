import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") !== "light");
    const [customerName, setCustomerName] = useState(() => localStorage.getItem("customerName") || "");
    const [profileOpen, setProfileOpen] = useState(false);
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const isSignedIn = Boolean(localStorage.getItem("customerToken"));
    const initial = (customerName.trim().charAt(0) || localStorage.getItem("customerEmail")?.charAt(0) || "U").toUpperCase();

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        document.body.classList.toggle("light-mode", !darkMode);
        document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        const refreshCustomer = () => {
            setCustomerName(localStorage.getItem("customerName") || "");
            setProfileOpen(false);
        };
        window.addEventListener("basketbro-auth-changed", refreshCustomer);
        window.addEventListener("storage", refreshCustomer);
        return () => {
            window.removeEventListener("basketbro-auth-changed", refreshCustomer);
            window.removeEventListener("storage", refreshCustomer);
        };
    }, []);

    const signOut = () => {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerRole");
        localStorage.removeItem("customerName");
        localStorage.removeItem("customerEmail");
        sessionStorage.removeItem("basketbroGuest");
        window.dispatchEvent(new Event("basketbro-auth-changed"));
        setProfileOpen(false);
        navigate("/", { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="navbar-brand-icon" aria-hidden="true">🛒</span>
                    <span>BasketBro</span>
                </Link>
                <div className="navbar-links">
                    <Link to="/">Products</Link>
                    <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`}>🛒 Cart ({cartCount})</Link>
                    <Link to={isSignedIn ? "/support" : "/customer/login"}>Customer Support</Link>
                    {isSignedIn && (
                        <div className="navbar-profile">
                            <button type="button" className="profile-avatar" aria-label="Open customer profile"
                                aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}>
                                {initial}
                            </button>
                            {profileOpen && (
                                <div className="profile-menu">
                                    <span className="profile-menu-name">{customerName || "Customer"}</span>
                                    <Link to="/my-orders" onClick={() => setProfileOpen(false)}>My orders</Link>
                                    <Link to="/support" onClick={() => setProfileOpen(false)}>My support requests</Link>
                                    <button type="button" onClick={signOut}>Sign out</button>
                                </div>
                            )}
                        </div>
                    )}
                    <button type="button" className="theme-toggle" onClick={() => setDarkMode(value => !value)}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {darkMode ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
