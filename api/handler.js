// Complete Market Map
const MARKET_MAP = {
  'www.croma.com': 71,
  'www.flipkart.com': 2,
  'flipkart.com': 2,
  'www.shopsy.in': 2, // Added Shopsy mapped to Flipkart
  'shopsy.in': 2,
  'www.amazon.in': 63,
  'www.myntra.com': 111,
  'www.nykaafashion.com': 6068,
  'www.tatacliq.com': 2190,
  'www.ajio.com': 2191,
  'www.healthkart.com': 921,
  'www.netmeds.com': 2238,
  'www.chumbak.com': 902,
  'www.purplle.com': 900,
  'www.1mg.com': 2237,
  'www.decathlon.in': 2335,
  'www.zigly.com': 6704,
  'www.boldcare.in': 6700,
  'fitspire.online': 6701,
  'kindlife.in': 6706,
  'www.nykaa.com': 1830,
  'www.portronics.com': 6702,
  'www.lenskart.com': 57,
  'www.easemytrip.com': 2255,
  'flight.easemytrip.com': 2255,
  'railways.easemytrip.com': 2255,
  'bus.easemytrip.com': 2255,
  'www.makemytrip.com': 1288,
  'cabs.makemytrip.com': 1288,
  'holidayz.makemytrip.com': 1288,
  'www.mivi.in': 6049,
  'www.bewakoof.com': 1059,
  'www.bigbasket.com': 2268,
  'thesleepcompany.in': 6705,
  'www.adanione.com': 6736,
  'www.naaptol.com': 441,
  'www.adidas.co.in': 2097,
  'www.zivame.com': 429,
  'www.pepperfry.com': 333,
  'www.trueelements.co.in': 6240,
  'in.puma.com': 6025,
  'www.goibibo.com': 1294,
  'giholidays.makemytrip.com': 1294,
  'www.crossword.in': 471,
  'nnnow.com': 2192,
  'books.rediff.com': 1037,
  'shopclues.com': 421,
  'www.snapdeal.com': 129,
  'www.shoppersstop.com': 45,
  'www.redbus.in': 1290,
  'www.koovs.com': 22,
  'www.jiomart.com': 6660,
  'yatra.com': 1293,
  'www.nykaaman.com': 8957,
  'www.reliancedigital.in': 6607,
  'www.vijaysales.com': 6645,
  'www.meesho.com': 7376,
  'www.amazon.com': 6326,
  'www.clovia.com': 1973,
  'www.cilory.com': 469,
  'www.aliexpress.com': 2376,
  'www.walmart.com': 6304,
  'www.homedepot.com': 6514,
  'www.target.com': 6306,
  'www.ebay.com': 1321,
  'www.kroger.com': 8958,
  'www.costco.com': 8959,
  'www.wayfair.com': 6307,
  'www.mercari.com': 8960,
  'www.poshmark.com': 8961,
  'poshmark.com': 8961,
  'www.etsy.com': 6305,
  'www.wish.com': 6103,
  'www.ikea.com/in*': 7209,
  'www.ikea.com/us*': 8962,
  'www.lg.com': 7322,
  'www.samsung.com': 4544,
  'www.daraz.pk': 8964,
  'www.bestbuy.com': 8967,
  'www.mi.com/in*': 8966,
  'us.shein.com': 8968,
  'www.adidas.com/us*': 8970,
  'www.amazon.co.uk': 8965,
  'www.amazon.ca': 8963,
  'www.macys.com': 6310,
  'luxury.tatacliq.com': 8972,
  'www.tripadvisor.in': 2350,
  'www.swiggy.com': 1822,
  'luxe.ajio.com': 8977,
  'www.lenovo.com/in': 6046,
  'firstcry.com': 2265,
  'www.theloom.in': 8973,
  'trends.ajio.com': 8975,
  'www.homecentre.in': 8974,
  'www2.hm.com': 7161,
  'www.lifestylestores.com': 8979,
  'www.faballey.com': 1179,
  'www.motorola.in': 8483,
  'in.urbanic.com': 7829,
  'www.noon.com': 8976,
  'www.zara.com/in': 7903,
  'www.oneplus.in': 6178,
  'www.tirabeauty.com': 8955,
  'www.triabeauty.com': 8980,
  'www.caratlane.com': 4391,
  'www.bluestone.com': 426,
  'www.miabytanishq.com': 8465,
  'trueelements.co.in': 6240,
  'www.limeroad.com': 424
};

const BASE_API = 'https://search-new.bitbns.com/buyhatke/sendData';

// Helper: Extract POS and PID from a given URL
function extractDataFromUrl(urlString) {
  try {
    const urlObj = new URL(urlString);
    const hostname = urlObj.hostname;
    const fullHref = urlObj.href;
    
    let pos = null;
    let pid = null;

    // 1. Determine POS
    // Prioritize wildcard/path matches first (e.g. www.ikea.com/in*)
    for (const [key, value] of Object.entries(MARKET_MAP)) {
      const cleanKey = key.replace('*', '');
      if (fullHref.includes(cleanKey)) {
        pos = value;
        break;
      }
    }

    // 2. Determine PID based on the detected POS/Hostname
    // Flipkart / Shopsy
    if (pos === 2) {
      pid = urlObj.searchParams.get('pid');
    } 
    // Amazon (All regions)
    else if ([63, 6326, 8965, 8963].includes(pos)) {
      const asinMatch = fullHref.match(/\/(?:dp|gp\/product|exec\/obidos\/ASIN)\/([A-Z0-9]{10})/i);
      if (asinMatch) pid = asinMatch[1];
    }
    // Generic fallback: Look for common query parameters
    else {
      pid = urlObj.searchParams.get('pid') || urlObj.searchParams.get('id');
      // If PID is in the path (e.g., Myntra often has it at the end of the URL before '?')
      if (!pid) {
         const pathMatch = urlObj.pathname.match(/\/([^/]+)\/?$/);
         if (pathMatch) pid = pathMatch[1];
      }
    }

    return { pos, pid };
  } catch (err) {
    return { pos: null, pid: null };
  }
}

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
    let { pos, pid, url } = req.query;

    // If URL is provided, automatically extract POS and PID
    if (url) {
      const extracted = extractDataFromUrl(url);
      if (extracted.pos) pos = extracted.pos;
      if (extracted.pid) pid = extracted.pid;
    }

    // Validation
    if (!pos || !pid) {
      return res.status(400).json({
        status: 0,
        error: 'Please provide either a valid product ?url= OR both ?pos= and ?pid=',
      });
    }

    // Find Market Name from ID (Reverse lookup)
    let marketName = 'unknown';
    for (const [key, value] of Object.entries(MARKET_MAP)) {
      if (value === Number(pos)) {
        marketName = key.replace('www.', '').replace('*', '');
        break;
      }
    }

    // API URL
    const apiUrl = `${BASE_API}?pos=${encodeURIComponent(pos)}&pid=${encodeURIComponent(pid)}`;

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
    const discountPercent = mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;

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
      product_url: product.link || (url ? url : ''),
      affiliate_url: `/api/affiliate?url=${encodeURIComponent(product.link || url || '')}`,
      variants: product.variants || [],
      buy_score: calculateBuyScore(discountPercent, product.rating),
      price_trend: generatePriceTrend(discountPercent),
      volatility: generateVolatility(),
      recommendation: getRecommendation(discountPercent),
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

// ==========================================
// LOGIC HELPERS
// ==========================================

function generatePriceTrend(discount) {
  if (discount >= 40) return 'Decreasing';
  if (discount >= 20) return 'Stable';
  return 'Increasing';
}

function generateVolatility() {
  const levels = ['Low', 'Medium', 'High'];
  return levels[Math.floor(Math.random() * levels.length)];
}

function calculateBuyScore(discount, rating) {
  const ratingScore = Number(rating || 0) * 10;
  return Math.min(100, Math.round(discount + ratingScore));
}

function getRecommendation(discount) {
  if (discount >= 60) return 'Best Deal';
  if (discount >= 30) return 'Good Deal';
  if (discount >= 10) return 'Average Deal';
  return 'Fair Price';
  }
  
