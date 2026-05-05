import { getDb } from './lib/mongodb.js';

// OneSignal config from Vercel ENV
const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 🔐 Admin protection
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
    // 🔔 OneSignal payload
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: [segment],

      headings: { en: title },
      contents: { en: body },

      // 🔥 Better UX
      android_sound: "default",
      ios_sound: "default",
      priority: 10,

      // 🔗 Click behavior
      ...(click_url && { url: click_url }),

      // 🖼 Image support
      ...(image_url && {
        big_picture: image_url, // Android
        ios_attachments: { id1: image_url }, // iOS
      }),

      // 📦 Extra data for app handling
      data: {
        click_url: click_url ?? '',
      },
    };

    // 🚀 Send to OneSignal
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_API_KEY}`, // ✅ FIXED
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // ❌ If OneSignal error
    if (!response.ok) {
      return res.status(500).json({
        error: 'OneSignal error',
        details: result,
      });
    }

    // 🧠 Save log in MongoDB
    let mongoStatus = 'not saved';

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

      mongoStatus = 'saved';
    } catch (dbError) {
      mongoStatus = `failed: ${dbError.message}`;
    }

    // ✅ Final response
    return res.status(200).json({
      success: true,
      id: result.id,
      recipients: result.recipients,
      mongo: mongoStatus,
    });

  } catch (e) {
    return res.status(500).json({
      error: 'Server error',
      message: e.message,
    });
  }
}
