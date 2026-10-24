import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productService";

function ProductDetails() {

    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchProduct = async () => {

            try {
                const response = await getProductById(id);
                setProduct(response.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load product.");
            } finally {
                setLoading(false);
            }

        };

        fetchProduct();

    }, [id]);

    if (loading) {
        return <h2>Loading product...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>

            <h1>{product.name}</h1>

            <p>Brand: {product.brand}</p>

            <p>
                Price: ₹{product.price.toLocaleString("en-IN")}
            </p>

            <p>Rating: ⭐ {product.rating}</p>

            <p>Quantity available: {product.quantity}</p>

            <p>Category: {product.category?.name}</p>

        </div>
    );
}

export default ProductDetails;
