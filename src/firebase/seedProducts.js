import { db } from "./config";
import { collection, addDoc } from "firebase/firestore";

const products = [
  // Electronics
  { name: "Wireless Headphones", category: "Electronics", price: 1999, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", description: "Premium sound quality with noise cancellation." },
  { name: "Smart Watch", category: "Electronics", price: 3499, rating: 4.3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", description: "Track fitness and stay connected." },
  { name: "Bluetooth Speaker", category: "Electronics", price: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", description: "Portable speaker with deep bass." },
  { name: "Laptop Stand", category: "Electronics", price: 799, rating: 4.4, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", description: "Ergonomic aluminum laptop stand." },

  // Fashion
  { name: "Men's Casual Shirt", category: "Fashion", price: 599, rating: 4.2, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", description: "Comfortable cotton casual shirt." },
  { name: "Women's Kurti", category: "Fashion", price: 799, rating: 4.6, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400", description: "Elegant floral print kurti." },
  { name: "Running Shoes", category: "Fashion", price: 1499, rating: 4.3, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Lightweight shoes for daily runs." },
  { name: "Leather Wallet", category: "Fashion", price: 499, rating: 4.0, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400", description: "Slim genuine leather wallet." },

  // Home & Kitchen
  { name: "Non-Stick Pan", category: "Home & Kitchen", price: 699, rating: 4.4, image: "https://images.unsplash.com/photo-1585837575652-267686159877?w=400", description: "Premium non-stick cooking pan." },
  { name: "Electric Kettle", category: "Home & Kitchen", price: 899, rating: 4.5, image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400", description: "Fast boiling 1.5L electric kettle." },
  { name: "Ceramic Mug Set", category: "Home & Kitchen", price: 399, rating: 4.2, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", description: "Set of 6 colorful ceramic mugs." },
  { name: "Wall Clock", category: "Home & Kitchen", price: 549, rating: 4.1, image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400", description: "Minimalist wooden wall clock." },

  // Sports
  { name: "Yoga Mat", category: "Sports", price: 599, rating: 4.6, image: "https://images.unsplash.com/photo-1601925228003-60443a2f8d3e?w=400", description: "Anti-slip premium yoga mat." },
  { name: "Dumbbells Set", category: "Sports", price: 1299, rating: 4.4, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", description: "5kg pair of rubber dumbbells." },
  { name: "Cricket Bat", category: "Sports", price: 999, rating: 4.3, image: "https://images.unsplash.com/photo-1540747913346-19378fc1c5a0?w=400", description: "Full size Kashmir willow bat." },
  { name: "Cycling Helmet", category: "Sports", price: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", description: "Lightweight safety helmet." },

  // Books
  { name: "Atomic Habits", category: "Books", price: 399, rating: 4.8, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", description: "Build good habits, break bad ones." },
  { name: "Rich Dad Poor Dad", category: "Books", price: 299, rating: 4.7, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", description: "Classic personal finance book." },
  { name: "The Alchemist", category: "Books", price: 249, rating: 4.6, image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", description: "An inspiring journey of self discovery." },
  { name: "Deep Work", category: "Books", price: 349, rating: 4.5, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", description: "Rules for focused success." },

  // Beauty
  { name: "Face Moisturizer", category: "Beauty", price: 449, rating: 4.3, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400", description: "Daily hydrating face cream." },
  { name: "Lipstick Set", category: "Beauty", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1586495777744-4e6232bf2845?w=400", description: "Set of 5 matte finish lipsticks." },
  { name: "Perfume", category: "Beauty", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400", description: "Long lasting floral fragrance." },
  { name: "Hair Serum", category: "Beauty", price: 349, rating: 4.2, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", description: "Frizz control hair serum." },
];

export const seedProducts = async () => {
  const colRef = collection(db, "products");
  for (const product of products) {
    await addDoc(colRef, product);
  }
  alert("✅ Products seeded successfully!");
};