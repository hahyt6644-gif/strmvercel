// File: /api/affiliate.js

export default async function handler(req, res) {
  // =========================
  // CORS
  // =========================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  // =========================
  // OPTIONS
  // =========================
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // =========================
  // Only GET / POST
  // =========================
  if (
    req.method !== 'POST' &&
    req.method !== 'GET'
  ) {
    return res.status(405).json({
      status: 0,
      error: 'Method not allowed',
    });
  }

  try {
    let deal;
    let convert_option = 'convert_only';

    // =========================
    // GET SUPPORT
    // Example:
    // /api/affiliate?url=https://...
    // =========================
    if (req.method === 'GET') {
      deal =
        req.query.url ||
        req.query.deal;

      convert_option =
        req.query.convert_option ||
        'convert_only';
    }

    // =========================
    // POST SUPPORT
    // =========================
    if (req.method === 'POST') {
      deal = req.body?.deal;
      convert_option =
        req.body?.convert_option ||
        'convert_only';
    }

    // =========================
    // Validation
    // =========================
    if (!deal) {
      return res.status(400).json({
        status: 0,
        error:
          'deal/url parameter is required',
      });
    }

    // =========================
    // EarnKaro Token
    // =========================
    const EARNKARO_TOKEN =
      process.env.EARNKARO_TOKEN ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWI0ZWI2MDliMTExOWE5ZDUzZDQyM2IiLCJlYXJua2FybyI6IjM4MjY0MDciLCJpYXQiOjE3Nzk5NjI4NjN9.TVDMfcSRj-0Jmb8F84L0FMv8wx3f-Jxs_9ixpsMmGzg';

    if (
      !EARNKARO_TOKEN ||
      EARNKARO_TOKEN ===
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWI0ZWI2MDliMTExOWE5ZDUzZDQyM2IiLCJlYXJua2FybyI6IjM4MjY0MDciLCJpYXQiOjE3Nzk5NjI4NjN9.TVDMfcSRj-0Jmb8F84L0FMv8wx3f-Jxs_9ixpsMmGzg'
    ) {
      return res.status(500).json({
        status: 0,
        error:
          'EarnKaro token missing',
      });
    }

    // =========================
    // Call EarnKaro API
    // =========================
    const response = await fetch(
      'https://ekaro-api.affiliaters.in/api/converter/public',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${EARNKARO_TOKEN}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          deal,
          convert_option,
        }),
      }
    );

    const result =
      await response.json();

    // =========================
    // API Error
    // =========================
    if (
      result.error === 1 ||
      !response.ok
    ) {
      return res.status(400).json({
        status: 0,
        error:
          result.message ||
          'Conversion failed',
      });
    }

    // =========================
    // Extract Converted Link
    // =========================
    const convertedDeal =
      result.data || '';

    const urlMatch =
      convertedDeal.match(
        /(https?:\/\/[^\s]+)/g
      );

    const affiliateLink =
      urlMatch?.[0] ||
      convertedDeal;

    // =========================
    // Success Response
    // =========================
    return res.status(200).json({
      status: 1,
      original_deal: deal,
      affiliate_link:
        affiliateLink,
      converted_deal:
        convertedDeal,
      random_post_id:
        result.randomPostID ||
        null,
    });
  } catch (error) {
    console.error(
      'Affiliate API Error:',
      error
    );

    return res.status(500).json({
      status: 0,
      error:
        error.message ||
        'Internal server error',
    });
  }
}
