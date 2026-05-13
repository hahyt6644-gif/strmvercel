// File: /api/banner.js

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 0,
      error: 'Method not allowed',
    });
  }

  try {
    // Static banners for MVP
    const banners = [
      {
        id: 1,
        title: 'Amazon Mega Sale',
        image:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200',
        redirect_url:
          'https://www.amazon.in/',
        active: true,
      },
      {
        id: 2,
        title: 'Flipkart Electronics Sale',
        image:
          'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200',
        redirect_url:
          'https://www.flipkart.com/',
        active: true,
      },
      {
        id: 3,
        title: 'Fashion Deals',
        image:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
        redirect_url:
          'https://www.myntra.com/',
        active: true,
      }
    ];

    return res.status(200).json({
      status: 1,
      total: banners.length,
      data: banners,
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

/api/banner.js

2. Paste this code

3. Deploy to Vercel

==================================================
API URL
==================================================

GET:
https://yourdomain.vercel.app/api/banner

==================================================
EXAMPLE
==================================================

https://yourdomain.vercel.app/api/banner

==================================================
RESPONSE
==================================================

{
  "status": 1,
  "total": 3,
  "data": [
    {
      "id": 1,
      "title": "Amazon Mega Sale",
      "image": "https://...",
      "redirect_url": "https://www.amazon.in/",
      "active": true
    }
  ]
}

==================================================
APP FLOW
==================================================

Home Page Open
↓
Fetch /api/banner
↓
Show Banner Slider
↓
User Click Banner
↓
Open redirect_url

==================================================

*/
