export default async function handler(req, res) { // Enable CORS res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// Handle preflight requests if (req.method === 'OPTIONS') { return res.status(200).end(); }

try { // Query params const { market = '', limit = 20, page = 1, } = req.query;

// External API URL
const apiUrl = `https://teraboxurll.in/admin_app/apis/get_deals.php?market=${encodeURIComponent(
  market
)}&limit=${limit}&page=${page}`;

// Fetch external API
const response = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (!response.ok) {
  return res.status(response.status).json({
    status: 0,
    error: 'Failed to fetch deals',
  });
}

const result = await response.json();

// Optional formatting
const formattedData = (result.data || []).map((item) => ({
  id: item.id,
  type: item.type || 'deal',
  name: item.name,
  image: item.image,
  cur_price: item.cur_price,
  site_name: item.site_name,
  site_logo: item.site_logo,
  link: item.link,
  rating: item.rating,
  maxall: item.maxall,
  avg: item.avg,
  pid: item.pid,
  created_at: item.created_at,

  // Extra calculated fields
  discount_percent:
    item.maxall && Number(item.maxall) > 0
      ? Math.round(
          ((Number(item.maxall) - Number(item.cur_price)) /
            Number(item.maxall)) *
            100
        )
      : 0,
}));

return res.status(200).json({
  status: 1,
  total: formattedData.length,
  page: Number(page),
  limit: Number(limit),
  data: formattedData,
});

} catch (error) { return res.status(500).json({ status: 0, error: error.message || 'Internal server error', }); } }

/*

HOW TO USE

1. Create Vercel project


2. Create folder: /api


3. Create file: /api/deals.js


4. Paste this code


5. Deploy to Vercel



======================================== API URL

https://yourdomain.vercel.app/api/deals

======================================== PARAMETERS

?page=1 &limit=20 &market=Flipkart

======================================== EXAMPLES

All deals: https://yourdomain.vercel.app/api/deals

Page 2: https://yourdomain.vercel.app/api/deals?page=2

Limit 10: https://yourdomain.vercel.app/api/deals?limit=10

Exclude Flipkart: https://yourdomain.vercel.app/api/deals?market=Flipkart

======================================== RESPONSE

{ "status": 1, "total": 20, "page": 1, "limit": 20, "data": [] }

*/
