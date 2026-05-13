// File: /api/affiliate.js

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 0,
      error: 'Method not allowed',
    });
  }

  try {
    // Body
    const {
      deal,
      convert_option = 'convert_only',
    } = req.body;

    // Validation
    if (!deal) {
      return res.status(400).json({
        status: 0,
        error: 'deal is required',
      });
    }

    // Your EarnKaro Token
    const EARNKARO_TOKEN =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWI0ZWI2MDliMTExOWE5ZDUzZDQyM2IiLCJlYXJua2FybyI6IjM4MjY0MDciLCJpYXQiOjE3Nzg2ODY0NTJ9.ConjXiA122viaSxBOEXzKgwEd6gl0V3Tcjykyv1rykU';

    // Request to EarnKaro API
    const response = await fetch(
      'https://ekaro-api.affiliaters.in/api/converter/public',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${EARNKARO_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal,
          convert_option,
        }),
      }
    );

    const result = await response.json();

    // API error
    if (result.error === 1) {
      return res.status(400).json({
        status: 0,
        error: result.message,
      });
    }

    // Extract converted affiliate links
    const convertedDeal = result.data || '';

    // Extract first URL
    const urlMatch = convertedDeal.match(
      /(https?:\/\/[^\s]+)/g
    );

    const affiliateLink = urlMatch
      ? urlMatch[0]
      : convertedDeal;

    // Success response
    return res.status(200).json({
      status: 1,

      original_deal: deal,

      affiliate_link: affiliateLink,

      converted_deal: convertedDeal,

      random_post_id: result.randomPostID || null,
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

/api/convert.js

2. Paste this code

3. Replace:

YOUR_EKARO_API_TOKEN

with your real token

4. Deploy on Vercel

==================================================
API URL
==================================================

POST:
https://yourdomain.vercel.app/api/convert

==================================================
BODY
==================================================

{
  "deal": "https://dl.flipkart.com/dl/product-link",
  "convert_option": "convert_only"
}

==================================================
FETCH EXAMPLE
==================================================

const response = await fetch(
  'https://yourdomain.vercel.app/api/convert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deal: 'https://dl.flipkart.com/dl/product-link',
      convert_option: 'convert_only',
    }),
  }
);

const data = await response.json();

console.log(data);

==================================================
RESPONSE
==================================================

{
  "status": 1,
  "original_deal": "https://dl.flipkart.com/...",
  "affiliate_link": "https://ekaro.in/enkr2026/...",
  "converted_deal": "Converted text...",
  "random_post_id": "abcd123"
}

==================================================
APP FLOW
==================================================

Deals API
↓
Product API
↓
Get Real Product URL
↓
Call /api/convert
↓
Get Your Affiliate Link
↓
Show Purchase Button
↓
User Clicks
↓
Earn Commission

==================================================

*/
