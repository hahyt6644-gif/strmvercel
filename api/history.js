// File: /api/history.js

const MARKET_POS = {
  flipkart: 2,
  shopsy: 2,
  amazon: 63,
  myntra: 111,
  ajio: 2191,
  croma: 71,
  nykaa: 1830,
  meesho: 7376,
  tatacliq: 2190,
  nykaafashion: 6068,
  healthkart: 921,
  netmeds: 2238,
  purplle: 900,
  onemg: 2237,
  lenskart: 57,
  jiomart: 6660,
  reliancedigital: 6607,
  vijaysales: 6645,
  snapdeal: 129,
  shopclues: 421,
  firstcry: 2265,
};

const DOMAIN_MAP = {
  'flipkart.com': 2,
  'dl.flipkart.com': 2,
  'shopsy.in': 2,

  'amazon.in': 63,
  'amazon.com': 6326,

  'myntra.com': 111,
  'ajio.com': 2191,
  'croma.com': 71,
  'nykaa.com': 1830,
  'nykaafashion.com': 6068,
  'meesho.com': 7376,
  'tatacliq.com': 2190,
  'healthkart.com': 921,
  'netmeds.com': 2238,
  'purplle.com': 900,
  '1mg.com': 2237,
  'lenskart.com': 57,
  'jiomart.com': 6660,
  'reliancedigital.in': 6607,
  'vijaysales.com': 6645,
  'snapdeal.com': 129,
  'shopclues.com': 421,
  'firstcry.com': 2265,
};

export default async function handler(req, res) {
  // =========================
  // CORS
  // =========================
  res.setHeader(
    'Access-Control-Allow-Origin',
    '*'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let {
      pid,
      market,
      pos,
      url,
    } = req.query;

    // =========================
    // URL SUPPORT
    // =========================
    if (url) {
      try {
        const parsedUrl = new URL(url);

        const hostname =
          parsedUrl.hostname.replace(
            'www.',
            ''
          );

        // Auto detect POS
        if (!pos) {
          pos = DOMAIN_MAP[hostname];
        }

        // Extract PID
        if (!pid) {
          pid =
            parsedUrl.searchParams.get(
              'pid'
            );

          // Amazon fallback
          if (
            !pid &&
            hostname.includes(
              'amazon'
            )
          ) {
            const match =
              parsedUrl.pathname.match(
                /\/dp\/([A-Z0-9]{10})/i
              );

            if (match) {
              pid = match[1];
            }
          }
        }
      } catch (_) {}
    }

    // =========================
    // DIRECT POS SUPPORT
    // =========================
    if (pos) {
      pos = Number(pos);
    }

    // =========================
    // MARKET FALLBACK
    // =========================
    if (!pos && market) {
      pos =
        MARKET_POS[
          market.toLowerCase()
        ];
    }

    // Default Flipkart
    if (!pos) {
      pos = 2;
    }

    // Validation
    if (!pid) {
      return res.status(400).json({
        status: 0,
        error:
          'pid is required',
      });
    }

    // =========================
    // API URL
    // =========================
    const apiUrl =
      `https://graph.bitbns.com/getPredictedData.php?pos=${pos}&pid=${encodeURIComponent(
        pid
      )}`;

    // =========================
    // FETCH DATA
    // =========================
    const response =
      await fetch(apiUrl);

    if (!response.ok) {
      return res.status(500).json({
        status: 0,
        error:
          'Failed to fetch history',
      });
    }

    const rawData =
      await response.text();

    if (
      !rawData ||
      rawData.length < 10
    ) {
      return res.status(404).json({
        status: 0,
        error:
          'No history found',
      });
    }

    // =========================
    // PARSE DATA
    // =========================
    const splitData =
      rawData.split('&~&~');

    const historyString =
      splitData[0];

    const entries =
      historyString
        .split('*~*')
        .filter(Boolean);

    const history =
      entries.map((entry) => {
        const parts =
          entry.split('~');

        return {
          date:
            parts[0] || '',
          price:
            Number(
              parts[1]
            ) || 0,
        };
      });

    if (!history.length) {
      return res.status(404).json({
        status: 0,
        error:
          'Invalid history data',
      });
    }

    // =========================
    // ANALYTICS
    // =========================
    const prices =
      history.map(
        (item) =>
          item.price
      );

    const lowestPrice =
      Math.min(...prices);

    const highestPrice =
      Math.max(...prices);

    const currentPrice =
      history[
        history.length - 1
      ]?.price || 0;

    const averagePrice =
      prices.reduce(
        (a, b) => a + b,
        0
      ) / prices.length;

    const firstPrice =
      history[0]?.price || 0;

    let trend = 'Stable';

    if (
      currentPrice <
      firstPrice
    ) {
      trend =
        'Decreasing';
    } else if (
      currentPrice >
      firstPrice
    ) {
      trend =
        'Increasing';
    }

    const volatilityPercent =
      lowestPrice > 0
        ? ((highestPrice -
            lowestPrice) /
            lowestPrice) *
          100
        : 0;

    let volatility =
      'Low';

    if (
      volatilityPercent >
      40
    ) {
      volatility =
        'High';
    } else if (
      volatilityPercent >
      15
    ) {
      volatility =
        'Medium';
    }

    const buyScore =
      Math.max(
        1,
        Math.min(
          100,
          Math.round(
            ((highestPrice -
              currentPrice) /
              highestPrice) *
              100
          )
        )
      );

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      status: 1,

      pid,
      pos,

      current_price:
        currentPrice,

      lowest_price:
        lowestPrice,

      highest_price:
        highestPrice,

      average_price:
        Number(
          averagePrice.toFixed(
            2
          )
        ),

      trend,

      volatility,

      buy_score:
        buyScore,

      total_records:
        history.length,

      history,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      error:
        error.message ||
        'Internal server error',
    });
  }
}
