import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist]   = useState([]);
  const [loading, setLoading]     = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      setLoading(true);
      const { data } = await API.get("/wishlist");
      setWishlist(data.products || []);
    } catch {
      // silently fail — wishlist is non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const isInWishlist = (productId) =>
    wishlist.some(p => (p._id || p) === productId || p._id === productId);

  const toggleWishlist = async (product) => {
    if (!user) { toast.error("Please login to save items"); return; }
    const alreadyIn = isInWishlist(product._id);
    // Optimistic update
    setWishlist(prev =>
      alreadyIn
        ? prev.filter(p => p._id !== product._id)
        : [...prev, product]
    );
    try {
      const { data } = await API.post("/wishlist/toggle", { productId: product._id });
      toast.success(data.message);
    } catch {
      fetchWishlist(); // rollback on error
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
