import { getDb } from './lib/mongodb.js';

const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { title, body, click_url, image_url, segment = 'All' } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body required' });
    }

    // 🔔 OneSignal payload
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
      data: { click_url: click_url || '' },
    };

    // 🚀 Send push
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // ❗ Check OneSignal error
    if (result.errors) {
      return res.status(500).json({
        error: 'OneSignal Error',
        details: result.errors,
      });
    }

    // 🧠 MongoDB logging (STRICT)
    try {
      const db = await getDb();

      await db.collection('notifications').insertOne({
        title,
        body,
        click_url,
        image_url,
        segment,
        onesignal_id: result.id,
        recipients: result.recipients,
        sent_at: new Date(),
      });

    } catch (dbError) {
      // 🔥 RETURN ERROR instead of hiding it
      return res.status(500).json({
        error: 'MongoDB Error',
        message: dbError.message,
      });
    }

    // ✅ Success
    return res.status(200).json({
      success: true,
      onesignal_id: result.id,
    });

  } catch (e) {
    return res.status(500).json({
      error: 'Server Error',
      message: e.message,
    });
  }
}
