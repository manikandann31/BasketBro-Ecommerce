import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsPaged, searchProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { getCategories } from "../services/categoryService";

function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [sort, setSort] = useState("id,asc");
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showWelcome, setShowWelcome] = useState(
        () => !localStorage.getItem("customerToken") && sessionStorage.getItem("basketbroGuest") !== "true"
    );
    const pageSize = 6;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                const data = response.data;
                const categoryList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];
                setCategories(categoryList);
                if (!Array.isArray(data) && categoryList.length === 0) {
                    console.error("Unexpected categories API response:", data);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const response = searchKeyword.trim() === "" && selectedCategory === ""
                    ? await getProductsPaged(currentPage, pageSize, sort)
                    : await searchProducts(searchKeyword, selectedCategory, currentPage, pageSize, sort);
                setProducts(Array.isArray(response.data?.content) ? response.data.content : []);
                setTotalPages(response.data?.totalPages ?? 0);
            } catch (err) {
                console.error("Failed to load products:", err);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage, sort, searchKeyword, selectedCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchKeyword(searchInput);
        setCurrentPage(0);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setCurrentPage(0);
    };

    const handlePrevious = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const continueAsGuest = () => {
        sessionStorage.setItem("basketbroGuest", "true");
        setShowWelcome(false);
    };

    if (loading) return <h2>Loading products...</h2>;
    if (error) return <h2>{error}</h2>;

    return (
        <>
            {showWelcome && (
                <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
                    <div className="welcome-card">
                        <div className="welcome-icon">🛒</div>
                        <span className="welcome-eyebrow">WELCOME TO BASKETBRO</span>
                        <h1 id="welcome-title">How would you like to continue?</h1>
                        <p>Sign in to your account, create a new one, or explore the store as a guest.</p>
                        <div className="welcome-actions">
                            <Link className="welcome-primary" to="/customer/login?mode=login&returnTo=%2F">Sign in</Link>
                            <Link className="welcome-secondary" to="/customer/login?mode=register&returnTo=%2F">Create a new account</Link>
                            <button className="welcome-guest" type="button" onClick={continueAsGuest}>Continue without profile</button>
                        </div>
                        <small>You can browse products as a guest. An account may be required for account-based features.</small>
                    </div>
                </div>
            )}

            <div>
                <section className="brand-hero">
                    <div className="brand-hero-content">
                        <span className="brand-eyebrow">WELCOME TO BASKETBRO</span>
                        <h1>Your Basket. <span>Your World.</span></h1>
                        <p>Discover great products, explore your favorites, and enjoy a simpler shopping experience.</p>
                    </div>
                </section>

                <div className="product-toolbar">
                    <form className="search-form" onSubmit={handleSearch}>
                        <input type="text" placeholder="Search products..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                        <button type="submit">Search</button>
                    </form>

                    <div className="category-control">
                        <label htmlFor="category">Category:</label>
                        <select id="category" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(0); }}>
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="button" className="clear-filters" onClick={() => {
                        setSearchInput("");
                        setSearchKeyword("");
                        setSelectedCategory("");
                        setSort("id,asc");
                        setCurrentPage(0);
                    }}>Clear Filters</button>

                    <div className="sort-control">
                        <label htmlFor="sort">Sort By:</label>
                        <select id="sort" value={sort} onChange={handleSortChange}>
                            <option value="id,asc">Default</option>
                            <option value="price,asc">Price: Low to High</option>
                            <option value="price,desc">Price: High to Low</option>
                            <option value="rating,desc">Rating: High to Low</option>
                            <option value="name,asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                <div className="product-grid">
                    {products.length > 0
                        ? products.map((product) => <ProductCard key={product.id} product={product} />)
                        : <h2>No products found.</h2>}
                </div>

                {totalPages > 0 && (
                    <div className="pagination">
                        <button onClick={handlePrevious} disabled={currentPage === 0}>Previous</button>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <button onClick={handleNext} disabled={currentPage === totalPages - 1}>Next</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Home;
