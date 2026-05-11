// File: /api/history.js

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
    const {
      pid,
      market = 'flipkart',
    } = req.query;

    // Validation
    if (!pid) {
      return res.status(400).json({
        status: 0,
        error: 'pid is required',
      });
    }

    // Market to POS mapping
    let pos = 2;

    switch (market.toLowerCase()) {
      case 'amazon':
        pos = 63;
        break;

      case 'myntra':
        pos = 111;
        break;

      case 'ajio':
        pos = 2191;
        break;

      case 'croma':
        pos = 71;
        break;

      case 'nykaa':
        pos = 1830;
        break;

      case 'meesho':
        pos = 7376;
        break;

      case 'flipkart':
      default:
        pos = 2;
        break;
    }

    // Graph API URL
    const apiUrl =
      `https://graph.bitbns.com/getPredictedData.php?pos=${pos}&pid=${encodeURIComponent(pid)}`;

    // Fetch graph data
    const response = await fetch(apiUrl);

    // Validate response
    if (!response.ok) {
      return res.status(500).json({
        status: 0,
        error: 'Failed to fetch history data',
      });
    }

    // Raw response
    const rawData = await response.text();

    // Empty response
    if (!rawData || rawData.length < 10) {
      return res.status(404).json({
        status: 0,
        error: 'No history data found',
      });
    }

    /*
      Format:
      date~price*~*date~price*~*
      &~&~100&~&~50&~&~50
    */

    // Split metadata
    const splitData = rawData.split('&~&~');

    // Main history string
    const historyString = splitData[0];

    // Split entries
    const entries = historyString
      .split('*~*')
      .filter((item) => item.trim() !== '');

    // Parse history
    const history = entries.map((entry) => {
      const parts = entry.split('~');

      return {
        date: parts[0] || '',
        price: Number(parts[1]) || 0,
      };
    });

    // No valid history
    if (history.length === 0) {
      return res.status(404).json({
        status: 0,
        error: 'Invalid history data',
      });
    }

    // Price calculations
    const prices = history.map((item) => item.price);

    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    const currentPrice =
      history[history.length - 1]?.price || 0;

    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) /
      prices.length;

    // Trend calculation
    const firstPrice = history[0]?.price || 0;

    let trend = 'Stable';

    if (currentPrice < firstPrice) {
      trend = 'Decreasing';
    } else if (currentPrice > firstPrice) {
      trend = 'Increasing';
    }

    // Volatility calculation
    const volatilityPercent =
      ((highestPrice - lowestPrice) / lowestPrice) * 100;

    let volatility = 'Low';

    if (volatilityPercent > 40) {
      volatility = 'High';
    } else if (volatilityPercent > 15) {
      volatility = 'Medium';
    }

    // Buy score
    const buyScore = Math.max(
      1,
      Math.min(
        100,
        Math.round(
          ((highestPrice - currentPrice) /
            highestPrice) *
            100
        )
      )
    );

    // Response
    return res.status(200).json({
      status: 1,

      market,
      pid,

      current_price: currentPrice,

      lowest_price: lowestPrice,

      highest_price: highestPrice,

      average_price: Number(
        averagePrice.toFixed(2)
      ),

      trend,

      volatility,

      buy_score: buyScore,

      total_records: history.length,

      history,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      error: error.message || 'Internal server error',
    });
  }
}

/*

==================================================
HOW TO USE
==================================================

1. Create file:

/api/history.js

2. Paste this code

3. Deploy to Vercel

==================================================
API URL
==================================================

https://yourdomain.vercel.app/api/history

==================================================
PARAMETERS
==================================================

?pid=DEOHDTFQMG9MJWZZ
&market=flipkart

==================================================
EXAMPLES
==================================================

Flipkart:
https://yourdomain.vercel.app/api/history?pid=DEOHDTFQMG9MJWZZ&market=flipkart

Amazon:
https://yourdomain.vercel.app/api/history?pid=B07Z3MN8K1&market=amazon

==================================================
RESPONSE
==================================================

{
  "status": 1,
  "market": "flipkart",
  "pid": "DEOHDTFQMG9MJWZZ",

  "current_price": 19398,

  "lowest_price": 5114,

  "highest_price": 26398,

  "average_price": 20844.23,

  "trend": "Decreasing",

  "volatility": "High",

  "buy_score": 27,

  "total_records": 150,

  "history": [
    {
      "date": "2025-07-23 04:35:11",
      "price": 16274.59
    }
  ]
}

==================================================
FRONTEND USAGE
==================================================

Use:
history[]

for charts.

Use:
- current_price
- lowest_price
- highest_price
- average_price
- trend
- volatility
- buy_score

for product analytics cards.

==================================================

*/
