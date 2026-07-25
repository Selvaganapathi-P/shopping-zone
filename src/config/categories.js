// Permanent category config — never derived from DB
export const MAIN_CATEGORIES = [
  { name: "Electronics",            icon: "📱" },
  { name: "Fashion",                icon: "👗" },
  { name: "Home & Kitchen",         icon: "🏠" },
  { name: "Beauty & Personal Care", icon: "💄" },
  { name: "Sports & Fitness",       icon: "⚽" },
  { name: "Books",                  icon: "📚" },
  { name: "Groceries",              icon: "🛒" },
  { name: "Jewellery & Watches",    icon: "💍" },
  { name: "Travel & Luggage",       icon: "🧳" },
  { name: "Baby Products",          icon: "🍼" },
  { name: "Pet Supplies",           icon: "🐾" },
  { name: "Automotive",             icon: "🚗" },
  { name: "Office Supplies",        icon: "🖊️" },
  { name: "Musical Instruments",    icon: "🎸" },
];

export const SUBCATEGORIES = {
  Electronics: [
    "Mobiles","Laptops","Tablets","Smart Watches","Earbuds","Headphones",
    "Bluetooth Speakers","Televisions","Monitors","Cameras","Gaming Consoles",
    "Gaming Peripherals","Power Banks","Chargers","Keyboards","Mouse","Webcams",
  ],
  Fashion: [
    "Men's Clothing","Women's Clothing","Kids' Clothing","Men's Footwear",
    "Women's Footwear","Bags & Accessories","Ethnic Wear","Sportswear","Winter Wear",
  ],
  "Home & Kitchen": [
    "Kitchen Appliances","Cookware","Furniture","Mattresses & Bedding",
    "Home Decor","Cleaning Supplies","Storage & Organisation","Large Appliances",
  ],
  "Beauty & Personal Care": [
    "Skin Care","Hair Care","Makeup","Men's Grooming","Perfumes","Body Care",
  ],
  "Sports & Fitness": [
    "Cricket","Football","Badminton","Gym Equipment","Running",
    "Yoga & Meditation","Cycling","Swimming","Basketball","Tennis",
  ],
  Books: [
    "Self Help","Fiction","Programming","Business & Finance",
    "Science","Biography","Children's","History","Engineering","Medical",
  ],
  Groceries: [
    "Beverages","Snacks","Staples","Oils & Spices","Dairy",
    "Instant Food","Health Food","Dry Fruits","Organic Foods",
  ],
  "Jewellery & Watches": [
    "Gold Jewellery","Silver Jewellery","Diamond Jewellery",
    "Fashion Jewellery","Men's Watches","Women's Watches","Smart Watches",
  ],
  "Travel & Luggage": [
    "Trolley Bags","Backpacks","Travel Accessories","Wallets & Purses",
  ],
  "Baby Products": [
    "Diapers & Wipes","Baby Food","Baby Clothing","Toys & Games","Baby Care",
  ],
  "Pet Supplies": ["Dog Food","Cat Food","Pet Accessories","Pet Grooming"],
  Automotive: ["Car Accessories","Bike Accessories","Car Care","Tools & Equipment"],
  "Office Supplies": ["Stationery","Printers & Ink","Desk Accessories","Paper & Notebooks"],
  "Musical Instruments": ["Guitars","Keyboards & Pianos","Drums","Wind Instruments","Accessories"],
};

export const CATEGORY_NAMES = ["All", ...MAIN_CATEGORIES.map(c => c.name)];

export const NAV_LINKS = [
  { label: "All",         cat: null,                       icon: null  },
  { label: "Electronics", cat: "Electronics",              icon: "📱"  },
  { label: "Fashion",     cat: "Fashion",                  icon: "👗"  },
  { label: "Home",        cat: "Home & Kitchen",           icon: "🏠"  },
  { label: "Sports",      cat: "Sports & Fitness",         icon: "⚽"  },
  { label: "Beauty",      cat: "Beauty & Personal Care",   icon: "💄"  },
  { label: "Books",       cat: "Books",                    icon: "📚"  },
  { label: "Groceries",   cat: "Groceries",                icon: "🛒"  },
  { label: "Jewellery",   cat: "Jewellery & Watches",      icon: "💍"  },
  { label: "Travel",      cat: "Travel & Luggage",         icon: "🧳"  },
  { label: "Baby",        cat: "Baby Products",            icon: "🍼"  },
  { label: "Pets",        cat: "Pet Supplies",             icon: "🐾"  },
  { label: "Auto",        cat: "Automotive",               icon: "🚗"  },
  { label: "Offers",      cat: null,                       icon: null, hot: true },
  { label: "New Arrivals",cat: null,                       icon: null  },
];

export const SEARCH_CATS = ["All", ...MAIN_CATEGORIES.map(c => c.name)];
