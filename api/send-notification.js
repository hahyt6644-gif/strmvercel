export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { title, body, click_url, image_url } = req.body || {};

    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: { en: title || 'Default Title' },
      contents: { en: body || 'Default Message' },
      ...(click_url && { url: click_url }),
      ...(image_url && {
        big_picture: image_url,
        ios_attachments: { id1: image_url },
      }),
      data: { click_url: click_url || '' },
    };

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    return res.status(200).json({
      success: true,
      onesignal_response: text,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
