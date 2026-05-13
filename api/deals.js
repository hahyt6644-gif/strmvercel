export default async function handler(req, res) {
  // ==============================
  // CORS
  // ==============================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow only GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 0,
      error: 'Method not allowed',
    });
  }

  try {
    // ==============================
    // Query Params
    // ==============================
    const {
      market = '',
      limit = 20,
      page = 1,
      min_discount = 0,
      sort = 'latest',
    } = req.query;

    // ==============================
    // Build External API URL
    // ==============================
    const apiUrl =
      `https://teraboxurll.in/admin_app/apis/get_deals.php` +
      `?market=${encodeURIComponent(market)}` +
      `&limit=${limit}` +
      `&page=${page}`;

    // ==============================
    // Fetch External API
    // ==============================
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Error from source API
    if (!response.ok) {
      return res.status(response.status).json({
        status: 0,
        error: 'Failed to fetch deals',
      });
    }

    // Parse response
    const result = await response.json();

    // ==============================
    // Format Data
    // ==============================
    let formattedData = (result.data || []).map((item) => {
      const currentPrice = Number(item.cur_price || 0);
      const oldPrice = Number(item.maxall || 0);

      // Discount %
      const discountPercent =
        oldPrice > 0
          ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
          : 0;

      // Deal quality score
      let dealScore = 50;

      if (discountPercent >= 70) {
        dealScore = 95;
      } else if (discountPercent >= 50) {
        dealScore = 85;
      } else if (discountPercent >= 30) {
        dealScore = 70;
      } else if (discountPercent >= 15) {
        dealScore = 60;
      }

      return {
        id: item.id || '',
        type: item.type || 'deal',

        // Product
        name: item.name || '',
        image: item.image || '',

        // Pricing
        cur_price: currentPrice,
        old_price: oldPrice,
        avg_price: Number(item.avg || 0),

        // Discount
        discount_percent: discountPercent,

        // Marketplace
        site_name: item.site_name || '',
        site_logo: item.site_logo || '',

        // Product info
        pid: item.pid || '',
        link: item.link || '',

        // Ratings
        rating: Number(item.rating || 0),

        // Analytics
        deal_score: dealScore,

        // Time
        created_at: item.created_at || '',

        // Buy Recommendation
        recommendation:
          discountPercent >= 50
            ? 'Best Deal'
            : discountPercent >= 25
            ? 'Good Deal'
            : 'Average Deal',
      };
    });

    // ==============================
    // Filter by Min Discount
    // ==============================
    formattedData = formattedData.filter(
      (item) => item.discount_percent >= Number(min_discount)
    );

    // ==============================
    // Sorting
    // ==============================
    switch (sort) {
      case 'discount':
        formattedData.sort(
          (a, b) => b.discount_percent - a.discount_percent
        );
        break;

      case 'price_low':
        formattedData.sort((a, b) => a.cur_price - b.cur_price);
        break;

      case 'price_high':
        formattedData.sort((a, b) => b.cur_price - a.cur_price);
        break;

      case 'rating':
        formattedData.sort((a, b) => b.rating - a.rating);
        break;

      default:
        // latest
        break;
    }

    // ==============================
    // Final Response
    // ==============================
    return res.status(200).json({
      status: 1,

      api: 'Deals API',

      filters: {
        market,
        page: Number(page),
        limit: Number(limit),
        min_discount: Number(min_discount),
        sort,
      },

      total: formattedData.length,

      data: formattedData,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      error: error.message || 'Internal server error',
    });
  }
}

/*

========================================
DEPLOY
========================================

1. Create /api/deals.js
2. Paste code
3. Deploy to Vercel

========================================
BASE URL
========================================

https://strmvercel.vercel.app/api/deals

========================================
PARAMETERS
========================================

?page=1
&limit=20
&market=Flipkart
&min_discount=50
&sort=discount

========================================
SORT OPTIONS
========================================

latest
discount
price_low
price_high
rating

========================================
EXAMPLES
========================================

All deals:
https://strmvercel.vercel.app/api/deals

Flipkart only:
https://strmvercel.vercel.app/api/deals?market=Flipkart

High discounts:
https://strmvercel.vercel.app/api/deals?min_discount=50

Sort by discount:
https://strmvercel.vercel.app/api/deals?sort=discount

Cheap products:
https://strmvercel.vercel.app/api/deals?sort=price_low

========================================
RESPONSE
========================================

{
  "status": 1,
  "api": "Deals API",
  "filters": {},
  "total": 20,
  "data": []
}

*/
