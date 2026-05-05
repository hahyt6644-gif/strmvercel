import { getDb } from './lib/mongodb.js';

// OneSignal REST API
const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    title,
    body,
    image_url,
    click_url,
    segment = 'All',
  } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body required' });
  }

  try {
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: [segment],
      headings: { en: title },
      contents: { en: body },
      ...(click_url && { url: click_url }),
      ...(image_url && {
        big_picture: image_url,
        ios_attachments: { id1: image_url },
      }),
      data: { click_url: click_url ?? '' },
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // ✅ SAFE RESPONSE HANDLING
    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: 'Invalid JSON from OneSignal',
        raw: text,
      });
    }

    // ❌ OneSignal error handling
    if (!response.ok) {
      return res.status(500).json({
        error: 'OneSignal API error',
        result,
      });
    }

    // ✅ MongoDB log (optional safety)
    try {
      const db = await getDb();
      await db.collection('notifications').insertOne({
        title,
        body,
        image_url,
        click_url,
        segment,
        onesignal_id: result.id,
        recipients: result.recipients,
        sent_at: new Date(),
      });
    } catch (dbError) {
      console.error('MongoDB error:', dbError.message);
    }

    return res.status(200).json({ success: true, result });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
