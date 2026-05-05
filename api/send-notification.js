const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export default async function handler(req, res) {
  try {
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: "Test Push" },
      contents: { en: "Hello from Vercel 🚀" }
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    return res.status(200).json({
      ok: response.ok,
      response: text
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
