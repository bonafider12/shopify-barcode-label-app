export const MOCK_PRODUCTS = [
  {
    id: "prod_1",
    title: "Organic Cold-Pressed Green Juice",
    variant: "16 fl oz / 473 ml",
    sku: "JUICE-GRN-16",
    barcode: "850012948012",
    barcodeType: "CODE128",
    price: 8.99,
    compareAtPrice: 10.99,
    unitPrice: "$0.56 / fl oz",
    vendor: "Verdant Organics",
    category: "Grocery & Beverages",
    origin: "Made in USA",
    netWeight: "16 fl oz (473ml)",
    ecoBadge: "100% Organic",
    badges: ["Best Seller", "Cold Pressed"],
    location: "Aisle 3 • Shelf B • Bin 04",
    description: "Kale, Spinach, Cucumber, Green Apple, Lemon & Ginger.",
    qrUrl: "https://myshopify-store.com/products/green-juice",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "prod_2",
    title: "Artisanal Single-Origin Espresso Beans",
    variant: "12 oz (340g) - Whole Bean",
    sku: "COF-ETH-12OZ",
    barcode: "079357318924",
    barcodeType: "EAN13",
    price: 18.50,
    compareAtPrice: 22.00,
    unitPrice: "$1.54 / oz",
    vendor: "Roast & Relish Co.",
    category: "Gourmet Foods",
    origin: "Ethiopia Yirgacheffe",
    netWeight: "12 oz (340g)",
    ecoBadge: "Fair Trade Certified",
    badges: ["Staff Pick", "Direct Trade"],
    location: "Aisle 1 • Shelf A • Bin 12",
    description: "Floral notes of jasmine, bergamot, and lemon curd.",
    qrUrl: "https://myshopify-store.com/products/espresso-beans",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "prod_3",
    title: "Minimalist Linen Oversized Shirt",
    variant: "Natural Flax / Medium",
    sku: "SHIRT-LIN-MED",
    barcode: "194252019481",
    barcodeType: "CODE128",
    price: 74.00,
    compareAtPrice: 95.00,
    unitPrice: "$74.00 / ea",
    vendor: "Aura Apparel Studio",
    category: "Apparel & Accessories",
    origin: "Crafted in Portugal",
    netWeight: "220g 100% Linen",
    ecoBadge: "Sustainable Fiber",
    badges: ["New Season", "100% Linen"],
    location: "Aisle 8 • Rack 2 • Size M",
    description: "Breathable European flax fabric with mother-of-pearl buttons.",
    qrUrl: "https://myshopify-store.com/products/linen-shirt",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "prod_4",
    title: "Hydrating Hyaluronic Botanical Serum",
    variant: "30ml / 1.0 fl oz",
    sku: "SKIN-SER-30ML",
    barcode: "360052389104",
    barcodeType: "UPCA",
    price: 42.00,
    compareAtPrice: 52.00,
    unitPrice: "$42.00 / fl oz",
    vendor: "Botanica Lab",
    category: "Beauty & Skincare",
    origin: "Made in France",
    netWeight: "30 ml (1 fl oz)",
    ecoBadge: "Cruelty Free & Vegan",
    badges: ["Clean Beauty", "Dermatologist Tested"],
    location: "Beauty Bar • Bay 4 • Shelf C",
    description: "Triple-molecular weight hyaluronic acid with rosewater.",
    qrUrl: "https://myshopify-store.com/products/hyaluronic-serum",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "prod_5",
    title: "Nordic Ceramic Matte Mug",
    variant: "Matte Charcoal / 14 oz",
    sku: "HOME-MUG-BLK",
    barcode: "692847291048",
    barcodeType: "QR",
    price: 24.00,
    compareAtPrice: 28.00,
    unitPrice: "$24.00 / ea",
    vendor: "Fjord Living",
    category: "Home & Kitchen",
    origin: "Handcrafted in Japan",
    netWeight: "380g Stoneware",
    ecoBadge: "Handmade Ceramic",
    badges: ["Limited Batch"],
    location: "Aisle 5 • Shelf D • Bin 02",
    description: "Dishwasher and microwave safe lead-free ceramic mug.",
    qrUrl: "https://myshopify-store.com/products/nordic-mug",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "prod_6",
    title: "Noise-Canceling Wireless Earbuds",
    variant: "Space Gray / Pro",
    sku: "TECH-EAR-GRY",
    barcode: "889842109572",
    barcodeType: "CODE128",
    price: 129.99,
    compareAtPrice: 159.99,
    unitPrice: "$129.99 / ea",
    vendor: "Acoustic Audio",
    category: "Electronics",
    origin: "Designed in California",
    netWeight: "52g Case + Buds",
    ecoBadge: "Recycled Tech",
    badges: ["ANC Pro", "32hr Battery"],
    location: "Electronics Lockup • Bay 1",
    description: "Active noise cancellation with transparency mode and spatial audio.",
    qrUrl: "https://myshopify-store.com/products/wireless-earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80"
  }
];

export const PRESET_LOGOS = [
  {
    id: "logo_1",
    name: "Modern Minimalist",
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 30 L25 10 L40 30 L32 30 L25 18 L18 30 Z" fill="#111827"/>
      <circle cx="25" cy="9" r="3" fill="#10B981"/>
      <text x="45" y="27" font-family="Inter, sans-serif" font-weight="800" font-size="16" fill="#111827">VERDANT</text>
    </svg>`
  },
  {
    id: "logo_2",
    name: "Luxury Crest",
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="24" height="24" rx="12" fill="none" stroke="#B45309" stroke-width="2"/>
      <text x="17" y="25" font-family="Oswald, sans-serif" font-size="14" font-weight="bold" fill="#B45309" text-anchor="middle">A</text>
      <text x="35" y="26" font-family="Inter, sans-serif" font-weight="700" font-size="14" letter-spacing="2" fill="#1E293B">AURA</text>
    </svg>`
  },
  {
    id: "logo_3",
    name: "Botanical Leaf",
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 C 5 15, 20 5, 28 20 C 15 28, 10 28, 8 28 Z" fill="#059669"/>
      <path d="M12 24 C 18 18, 22 14, 28 20" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
      <text x="34" y="25" font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="#065F46">BOTANICA</text>
    </svg>`
  },
  {
    id: "logo_4",
    name: "Shopify Store Standard",
    svg: `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="24" height="24" rx="4" fill="#008060"/>
      <path d="M17 12 L22 17 L17 28 L12 28 Z" fill="#FFFFFF"/>
      <text x="35" y="25" font-family="Inter, sans-serif" font-weight="800" font-size="13" fill="#008060">STORE</text>
    </svg>`
  }
];
