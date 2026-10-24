import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cartItems");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    // Persist cart items across page refreshes.
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // Add a product to the cart.
    const addToCart = (product, quantity = 1) => {
        if (!product || product.id == null) {
            return { success: false, message: "Invalid product." };
        }

        const requestedQuantity = Number(quantity);
        const availableStock = Number(product.quantity);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return { success: false, message: "Invalid quantity." };
        }

        if (!Number.isInteger(availableStock) || availableStock < 0) {
            return {
                success: false,
                message: "Unable to verify product stock."
            };
        }

        const existingItem = cartItems.find(
            (item) => item.id === product.id
        );

        const newQuantity =
            (existingItem?.cartQuantity ?? 0) + requestedQuantity;

        if (newQuantity > availableStock) {
            return {
                success: false,
                message: `Only ${availableStock} units are currently available.`
            };
        }

        setCartItems((previousItems) => {
            const currentItem = previousItems.find(
                (item) => item.id === product.id
            );

            const updatedQuantity =
                (currentItem?.cartQuantity ?? 0) + requestedQuantity;

            if (updatedQuantity > availableStock) {
                return previousItems;
            }

            if (currentItem) {
                return previousItems.map((item) =>
                    item.id === product.id
                        ? { ...item, cartQuantity: updatedQuantity }
                        : item
                );
            }

            return [
                ...previousItems,
                { ...product, cartQuantity: requestedQuantity }
            ];
        });

        return { success: true, message: "Product added to cart." };
    };

    // Change the quantity of a cart item.
    const updateQuantity = (productId, quantity) => {
        const newQuantity = Number(quantity);

        if (!Number.isInteger(newQuantity) || newQuantity < 1) {
            return {
                success: false,
                message: "Quantity must be at least 1."
            };
        }

        const item = cartItems.find(
            (product) => product.id === productId
        );

        if (!item) {
            return { success: false, message: "Product not found in cart." };
        }

        if (newQuantity > Number(item.quantity)) {
            return {
                success: false,
                message: `Only ${item.quantity} units are currently available.`
            };
        }

        setCartItems((previousItems) =>
            previousItems.map((product) =>
                product.id === productId
                    ? { ...product, cartQuantity: newQuantity }
                    : product
            )
        );

        return { success: true, message: "Cart updated." };
    };

    // Remove a product from the cart.
    const removeFromCart = (productId) => {
        setCartItems((previousItems) =>
            previousItems.filter((item) => item.id !== productId)
        );
    };

    // Empty the cart after a successful order.
    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.cartQuantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) =>
            total + Number(item.price) * item.cartQuantity,
        0
    );

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider.");
    }

    return context;
}