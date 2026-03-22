import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot
} from "firebase/firestore";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Listen to cart in Firestore in real time
  useEffect(() => {
    if (!user) return setCartItems([]);
    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (snap) => {
      if (snap.exists()) {
        setCartItems(snap.data().items || []);
      } else {
        setCartItems([]);
      }
    });
    return unsubscribe;
  }, [user]);

  // Add to cart
  const addToCart = async (product) => {
    if (!user) return;
    const cartRef = doc(db, "carts", user.uid);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) {
      await setDoc(cartRef, { items: [{ ...product, quantity: 1 }] });
      return;
    }

    const items = snap.data().items || [];
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      const updated = items.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      await updateDoc(cartRef, { items: updated });
    } else {
      await updateDoc(cartRef, {
        items: arrayUnion({ ...product, quantity: 1 }),
      });
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!user) return;
    const cartRef = doc(db, "carts", user.uid);
    const snap = await getDoc(cartRef);
    const items = snap.data().items || [];
    const updated = items.filter((i) => i.id !== productId);
    await updateDoc(cartRef, { items: updated });
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    if (quantity < 1) return removeFromCart(productId);
    const cartRef = doc(db, "carts", user.uid);
    const snap = await getDoc(cartRef);
    const items = snap.data().items || [];
    const updated = items.map((i) =>
      i.id === productId ? { ...i, quantity } : i
    );
    await updateDoc(cartRef, { items: updated });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};