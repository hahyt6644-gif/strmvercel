// api/compare.js

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: "Missing q parameter"
    });
  }

  const apiUrl =
    `https://pricee.com/api/v1/search.php?q=${encodeURIComponent(q)}&size=10&lang=en&vuid=0&platform=2`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch Pricee API"
      });
    }

    const json = await response.json();

    if (Array.isArray(json.data)) {
      json.data = json.data.map(item => {
        let product_url = null;

        switch ((item.source_name || "").toLowerCase()) {

          // Amazon
          case "amazon": {
            const asin = item.id.split("-")[1]?.toUpperCase();

            if (asin) {
              product_url = `https://www.amazon.in/dp/${asin}`;
            }
            break;
          }

          // Flipkart
          case "flipkart": {
            product_url = `https://www.flipkart.com/search?q=${encodeURIComponent(item.title)}`;
            break;
          }

          // Default
          default: {
            product_url = item.url || null;
          }
        }

        return {
          ...item,
          product_url
        };
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(json);

  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
}
