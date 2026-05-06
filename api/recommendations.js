export default async function handler(req, res) {
  const { category = "general" } = req.query;

  const data = [
    {
      title: "Journey of Love 18+ (2023)",
      genre: "Crime, Thriller",
      duration: "2h 02min",
      language: "Hindi + Malayalam",
      category: "crime",
      url: "https://1024terabox.com/s/1GaSz2cA7nB3sJ8HkHflogg",
      thumbnail: "https://i.ibb.co/rGNGrjTx/4ca454c4afa6.jpg"
    },
    {
      title: "Journey of Love 18+ (2023)",
      genre: "Crime, Thriller",
      duration: "2h 02min",
      language: "Hindi + Malayalam",
      category: "crime",
      url: "https://1024terabox.com/s/1GaSz2cA7nB3sJ8HkHflogg",
      thumbnail: "https://i.ibb.co/rGNGrjTx/4ca454c4afa6.jpg"
    },
    {
      title: "Vaazha",
      genre: "Crime, Drama",
      duration: "2h 01min",
      language: "Hindi + Malayalam",
      category: "movie",
      url: "https://1024terabox.com/s/1lmLbhspNu-wWCuEp9fxYvw",
      thumbnail: "https://i.ibb.co/DgkQkyKp/f1775c5d8d4c.jpg"
    },
    {
      title: "Romantic Movie Example",
      genre: "Romance",
      duration: "1h 50min",
      language: "Hindi",
      category: "movie",
      url: "https://example.com/romance",
      thumbnail: "https://i.ibb.co/example.jpg"
    }
  ];

  // 🔥 Filter by category
  let filtered = data;

  if (category && category !== "general") {
    filtered = data.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // fallback if no match
  if (filtered.length === 0) {
    filtered = data;
  }

  return res.status(200).json(filtered);
}
