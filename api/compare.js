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
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch Pricee API"
      });
    }

    const data = await response.json();

    if (Array.isArray(data.data)) {
      data.data = await Promise.all(
        data.data.map(async (item) => {
          let product_url = item.url || null;

          try {
            // Follow Pricee redirect to final marketplace URL
            const redirect = await fetch(item.url, {
              method: "GET",
              redirect: "follow",
              headers: {
                "User-Agent": "Mozilla/5.0"
              }
            });

            product_url = redirect.url;

            // If Amazon redirect fails, generate direct ASIN URL
            if (
              item.source_name?.toLowerCase() === "amazon" &&
              (!product_url || product_url.includes("pricee.com"))
            ) {
              const asin = item.id.split("-")[1]?.toUpperCase();
              if (asin) {
                product_url = `https://www.amazon.in/dp/${asin}`;
              }
            }
          } catch {
            // Fallback
            if (item.source_name?.toLowerCase() === "amazon") {
              const asin = item.id.split("-")[1]?.toUpperCase();
              if (asin) {
                product_url = `https://www.amazon.in/dp/${asin}`;
              }
            }
          }

          return {
            ...item,
            product_url
          };
        })
      );
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
}
