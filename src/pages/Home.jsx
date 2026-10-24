import { useEffect, useState } from "react";
import {
    getProductsPaged,
    searchProducts
} from "../services/productService";
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

    const pageSize = 6;

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const response = await getCategories();

                setCategories(response.data);

            } catch (error) {

                console.error("Failed to load categories:", error);

            }
        };

        fetchCategories();

    }, []);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);
                setError("");

                let response;

                if (
                    searchKeyword.trim() === "" &&
                    selectedCategory === ""
                ) {

                    response = await getProductsPaged(
                        currentPage,
                        pageSize,
                        sort
                    );

                } else {

                    response = await searchProducts(
                        searchKeyword,
                        selectedCategory,
                        currentPage,
                        pageSize,
                        sort
                    );
                }

                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);

            } catch (error) {

                console.error(error);
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

        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };


    const handleNext = () => {

        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };


    if (loading) {
        return <h2>Loading products...</h2>;
    }


    if (error) {
        return <h2>{error}</h2>;
    }


    return (
        <div>

            <section className="brand-hero">
                <div className="brand-hero-content">
                    <span className="brand-eyebrow">
                        WELCOME TO BASKETBRO
                    </span>

                    <h1>
                        Your Basket. <span>Your World.</span>
                    </h1>

                    <p>
                        Discover great products, explore your favorites,
                        and enjoy a simpler shopping experience.
                    </p>
                </div>
            </section>

            {/* Search and Sorting */}

            <div className="product-toolbar">

                <form
                    className="search-form"
                    onSubmit={handleSearch}
                >

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) =>
                            setSearchInput(e.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>

                </form>

                <div className="category-control">

                    <label htmlFor="category">
                        Category:
                    </label>

                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(0);
                        }}
                    >

                        <option value="">
                            All Categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}

                    </select>

                </div>

                <button
                    type="button"
                    className="clear-filters"
                    onClick={() => {
                        setSearchInput("");
                        setSearchKeyword("");
                        setSelectedCategory("");
                        setSort("id,asc");
                        setCurrentPage(0);
                    }}
                >
                    Clear Filters
                </button>
                <div className="sort-control">

                    <label htmlFor="sort">
                        Sort By:
                    </label>

                    <select
                        id="sort"
                        value={sort}
                        onChange={handleSortChange}
                    >

                        <option value="id,asc">
                            Default
                        </option>

                        <option value="price,asc">
                            Price: Low to High
                        </option>

                        <option value="price,desc">
                            Price: High to Low
                        </option>

                        <option value="rating,desc">
                            Rating: High to Low
                        </option>

                        <option value="name,asc">
                            Name: A to Z
                        </option>

                    </select>

                </div>

            </div>


            {/* Product Grid */}

            <div className="product-grid">

                {products.length > 0 ? (

                    products.map((product) => (

                        <ProductCard
                            key={product.id}
                            product={product}
                        />

                    ))

                ) : (

                    <h2>No products found.</h2>

                )}

            </div>


            {/* Pagination */}

            {totalPages > 0 && (

                <div className="pagination">

                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </button>


                    <span>
                        Page {currentPage + 1} of {totalPages}
                    </span>


                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages - 1}
                    >
                        Next
                    </button>

                </div>

            )}

        </div>
    );
}

export default Home;