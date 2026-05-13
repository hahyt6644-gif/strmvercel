const MARKET_MAP = {
  2: 'flipkart',
  63: 'amazon',
  111: 'myntra',
  2191: 'ajio',
  71: 'croma',
  1830: 'nykaa',
  7376: 'meesho',
};

const BASE_API =
  'https://search-new.bitbns.com/buyhatke/sendData';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Query params
    const { pos, pid } = req.query;

    // Validation
    if (!pos || !pid) {
      return res.status(400).json({
        status: 0,
        error: 'pos and pid are required',
      });
    }

    // Market name
    const marketName = MARKET_MAP[pos] || 'unknown';

    // API URL
    const apiUrl = `${BASE_API}?pos=${encodeURIComponent(
      pos
    )}&pid=${encodeURIComponent(pid)}`;

    // Fetch product details
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // API failed
    if (!response.ok) {
      return res.status(response.status).json({
        status: 0,
        error: 'Failed to fetch product details',
      });
    }

    // Parse response
    const result = await response.json();

    // Validate response
    if (result.status !== 1 || !result.data) {
      return res.status(404).json({
        status: 0,
        error: 'Product not found',
      });
    }

    const product = result.data;

    // Price calculations
    const mrp = Number(product.mrpFloat || 0);
    const currentPrice = Number(product.cur_price || 0);
    const avgPrice = Number(product.avg || 0);

    // Discount %
    const discountPercent =
      mrp > 0
        ? Math.round(((mrp - currentPrice) / mrp) * 100)
        : 0;

    // Recommendation logic
    const recommendation = getRecommendation(discountPercent);

    // Final response
    const formattedProduct = {
      name: product.name || '',

      image: product.image || '',

      images: product.thumbnailImages || [],

      current_price: currentPrice,

      mrp: mrp,

      avg_price: avgPrice,

      discount_percent: discountPercent,

      rating: Number(product.rating || 0),

      rating_count: Number(product.ratingCount || 0),

      in_stock: product.inStock === 1,

      pid: pid,

      pos: Number(pos),

      market: marketName,

      product_url: product.link || '',

      affiliate_url: `/api/affiliate?url=${encodeURIComponent(
        product.link || ''
      )}`,

      variants: product.variants || [],

      buy_score: calculateBuyScore(
        discountPercent,
        product.rating
      ),

      price_trend: generatePriceTrend(discountPercent),

      volatility: generateVolatility(),

      recommendation: recommendation,
    };

    return res.status(200).json({
      status: 1,
      data: formattedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      error: error.message || 'Internal server error',
    });
  }
}

// Price trend logic
function generatePriceTrend(discount) {
  if (discount >= 40) return 'Decreasing';

  if (discount >= 20) return 'Stable';

  return 'Increasing';
}

// Volatility logic
function generateVolatility() {
  const levels = ['Low', 'Medium', 'High'];

  return levels[Math.floor(Math.random() * levels.length)];
}

// Buy score logic
function calculateBuyScore(discount, rating) {
  const ratingScore = Number(rating || 0) * 10;

  const score = Math.min(
    100,
    Math.round(discount + ratingScore)
  );

  return score;
}

// Recommendation logic
function getRecommendation(discount) {
  if (discount >= 60) return 'Best Deal';

  if (discount >= 30) return 'Good Deal';

  if (discount >= 10) return 'Average Deal';

  return 'Fair Price';
}

/*

========================================
API URL
========================================

https://yourdomain.vercel.app/api/product

========================================
PARAMETERS
========================================

?pos=2&pid=DEOHDTFQMG9MJWZZ

========================================
EXAMPLES
========================================

Flipkart:
https://yourdomain.vercel.app/api/product?pos=2&pid=DEOHDTFQMG9MJWZZ

Amazon:
https://yourdomain.vercel.app/api/product?pos=63&pid=B07Z3MN8K1

========================================
SUPPORTED MARKET POS IDs
========================================

Flipkart = 2
Amazon = 63
Myntra = 111
Ajio = 2191
Croma = 71
Nykaa = 1830
Meesho = 7376

========================================
RESPONSE
========================================

{
  "status": 1,
  "data": {
    "name": "FOGG Neu Fine Amber Deodorant",
    "image": "https://...",
    "images": [],
    "current_price": 288,
    "mrp": 418,
    "avg_price": 322.84,
    "discount_percent": 31,
    "rating": 4,
    "rating_count": 1024,
    "in_stock": true,
    "pid": "DEOHDTFQMG9MJWZZ",
    "pos": 2,
    "market": "flipkart",
    "product_url": "https://...",
    "affiliate_url": "/api/affiliate?...",
    "variants": [],
    "buy_score": 70,
    "price_trend": "Stable",
    "volatility": "Medium",
    "recommendation": "Good Deal"
  }
}

*/
