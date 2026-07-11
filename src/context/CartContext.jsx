import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const fetchCart = async () => {
      try {
        const { data } = await API.get("/cart");
        setCartItems(data.items || []);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    fetchCart();
  }, [user]);

  // Add to cart
  const addToCart = async (product) => {
    try {
      const { data } = await API.post("/cart", {
        product: {
          productId:   product._id || product.id,
          name:        product.name,
          category:    product.category,
          price:       product.price,
          image:       product.image,
          description: product.description,
        },
      });
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      const { data } = await API.delete(`/cart/${productId}`);
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await API.put("/cart", { productId, quantity });
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await API.delete("/cart/clear");
      setCartItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity, 0
  );

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart,
      cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};