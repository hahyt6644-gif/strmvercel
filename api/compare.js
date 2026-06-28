export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: "Missing q parameter"
    });
  }

  const apiUrl = `https://pricee.com/api/v1/search.php?q=${encodeURIComponent(q)}&size=10&lang=en&vuid=0&platform=2`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const data = await response.json();

    if (Array.isArray(data.data)) {
      data.data = data.data.map(item => {
        let product_url = item.url || null;

        if ((item.source_name || "").toLowerCase() === "amazon") {
          const asin = item.id.split("-")[1]?.toUpperCase();
          if (asin) {
            product_url = `https://www.amazon.in/dp/${asin}`;
          }
        }

        if ((item.source_name || "").toLowerCase() === "flipkart") {
          product_url = `https://www.flipkart.com/search?q=${encodeURIComponent(item.title)}`;
        }

        return {
          ...item,
          product_url
        };
      });
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}
