import { useParams, Link } from "react-router-dom";

function OrderConfirmation() {
    const { orderId } = useParams();

    return (
        <div className="container">
            <h1>Order Confirmation</h1>
            <p>Order reference: {orderId}</p>
            <Link to="/">Continue Shopping</Link>
        </div>
    );
}

export default OrderConfirmation;