import { getDb } from './lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 🔐 Admin check
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 🔍 Show ENV status (safe debug)
  const debugEnv = {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasDbName: !!process.env.MONGODB_DB,
    hasOneSignalKey: !!process.env.ONESIGNAL_REST_API_KEY,
  };

  try {
    // 🔔 Send push first (so we know API works)
    const pushRes = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: 'Debug Push' },
        contents: { en: 'Testing Mongo + API' },
      }),
    });

    const pushText = await pushRes.text();

    // 🧠 Mongo test (FULL SAFE)
    let mongoResult = 'not tested';

    try {
      const db = await getDb();

      // simple ping
      await db.command({ ping: 1 });

      mongoResult = 'connected ✅';

    } catch (dbError) {
      mongoResult = `failed ❌: ${dbError.message}`;
    }

    return res.status(200).json({
      success: true,
      env: debugEnv,
      push: pushText,
      mongo: mongoResult,
    });

  } catch (e) {
    return res.status(500).json({
      error: 'Server crash',
      message: e.message,
      env: debugEnv,
    });
  }
}
