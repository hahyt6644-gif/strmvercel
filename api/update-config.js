import { getDb } from './lib/mongodb.js';

// Protect with a secret header: x-admin-key
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      latest_version_code,
      latest_version,
      download_url,
      force_update = false,
      whats_new = '',
      banner_image_url = null,
    } = req.body;

    if (!latest_version_code || !latest_version || !download_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    await db.collection('app_config').updateOne(
      { key: 'update' },
      {
        $set: {
          key: 'update',
          latest_version_code,
          latest_version,
          download_url,
          force_update,
          whats_new,
          banner_image_url,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}