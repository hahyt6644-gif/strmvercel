export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: '🧪 Test' },
        contents: { en: 'Minimal API test' },
      }),
    });

    const text = await response.text();

    return res.status(200).json({
      success: true,
      onesignal_response: text,
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
