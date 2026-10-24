import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme !== "light";
    });

    const { cartCount } = useCart();

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        document.body.classList.toggle("light-mode", !darkMode);

        document.documentElement.style.colorScheme =
            darkMode ? "dark" : "light";

        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((previous) => !previous);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="navbar-brand-icon" aria-hidden="true">
                        🛒
                    </span>
                    <span>BasketBro</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/">Products</Link>

                    <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`}>
                        🛒 Cart ({cartCount})
                    </Link>

                    <Link to="/admin/login">Admin Login</Link>

                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        title={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;