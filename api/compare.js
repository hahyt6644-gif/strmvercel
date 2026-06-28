// api/compare.js

export default async function handler(req, res) {
  const {
    q,
    size = 10,
    lang = "en",
    vuid = 0,
    platform = 2
  } = req.query;

  if (!q) {
    return res.status(400).json({
      error: "Missing q parameter"
    });
  }

  const apiUrl =
    `https://pricee.com/api/v1/search.php` +
    `?q=${encodeURIComponent(q)}` +
    `&size=${encodeURIComponent(size)}` +
    `&lang=${encodeURIComponent(lang)}` +
    `&vuid=${encodeURIComponent(vuid)}` +
    `&platform=${encodeURIComponent(platform)}`;

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
      await Promise.all(
        data.data.map(async (item) => {
          item.product_url = item.url;

          if (item.url) {
            try {
              const redirect = await fetch(item.url, {
                method: "GET",
                redirect: "follow",
                headers: {
                  "User-Agent": "Mozilla/5.0"
                }
              });

              item.product_url = redirect.url;
            } catch {
              item.product_url = item.url;
            }
          }
        })
      );
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate"
    );

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
}
