export default async function handler(req, res) { // Enable CORS res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// Handle OPTIONS request if (req.method === 'OPTIONS') { return res.status(200).end(); }

try { // Query params const { pos, pid, } = req.query;

// Validation
if (!pos || !pid) {
  return res.status(400).json({
    status: 0,
    error: 'pos and pid are required',
  });
}

// API URL
const apiUrl = `https://search-new.bitbns.com/buyhatke/sendData?pos=${encodeURIComponent(pos)}&pid=${encodeURIComponent(pid)}`;

// Fetch product details
const response = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (!response.ok) {
  return res.status(response.status).json({
    status: 0,
    error: 'Failed to fetch product details',
  });
}

const result = await response.json();

// Validate response
if (result.status !== 1 || !result.data) {
  return res.status(404).json({
    status: 0,
    error: 'Product not found',
  });
}

const product = result.data;

// Calculate discount percentage
const mrp = Number(product.mrpFloat || 0);
const currentPrice = Number(product.cur_price || 0);

const discountPercent =
  mrp > 0
    ? Math.round(((mrp - currentPrice) / mrp) * 100)
    : 0;

// Clean response
const formattedProduct = {
  name: product.name,
  image: product.image,
  images: product.thumbnailImages || [],

  current_price: currentPrice,
  mrp: mrp,
  discount_percent: discountPercent,

  rating: product.rating || '0',
  rating_count: product.ratingCount || '0',

  in_stock: product.inStock === 1,

  pid: pid,
  pos: Number(pos),

  product_url: product.link,

  variants: product.variants || [],

  // Extra analytics
  buy_score: calculateBuyScore(discountPercent, product.rating),
  price_trend: generatePriceTrend(discountPercent),
  volatility: generateVolatility(),
};

return res.status(200).json({
  status: 1,
  data: formattedProduct,
});

} catch (error) { return res.status(500).json({ status: 0, error: error.message || 'Internal server error', }); } }

// Generate fake trend for MVP function generatePriceTrend(discount) { if (discount >= 40) return 'Decreasing'; if (discount >= 20) return 'Stable'; return 'Increasing'; }

// Generate fake volatility for MVP function generateVolatility() { const levels = ['Low', 'Medium', 'High']; return levels[Math.floor(Math.random() * levels.length)]; }

// Simple buy score algorithm function calculateBuyScore(discount, rating) { const ratingScore = Number(rating || 0) * 10; const score = Math.min(100, Math.round(discount + ratingScore)); return score; }

/*

HOW TO USE

1. Create file: /api/product.js


2. Paste this code


3. Deploy to Vercel



================================================== API URL

https://yourdomain.vercel.app/api/product

================================================== PARAMETERS

?pos=2 &pid=DEOHDTFQMG9MJWZZ

================================================== EXAMPLES

Flipkart: https://yourdomain.vercel.app/api/product?pos=2&pid=DEOHDTFQMG9MJWZZ

Amazon: https://yourdomain.vercel.app/api/product?pos=63&pid=B07Z3MN8K1

================================================== RESPONSE

{ "status": 1, "data": { "name": "Product Name", "image": "https://...", "images": [], "current_price": 288, "mrp": 418, "discount_percent": 31, "rating": "4.0", "rating_count": "1024", "in_stock": true, "pid": "DEOHDTFQMG9MJWZZ", "pos": 2, "product_url": "https://...", "variants": [], "buy_score": 78, "price_trend": "Stable", "volatility": "Medium" } }

================================================== SUPPORTED MARKET POS IDs

Flipkart = 2 Amazon = 63 Myntra = 111 Ajio = 2191 Croma = 71 Nykaa = 1830 Meesho = 7376

*/
