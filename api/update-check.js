import { getDb } from './lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const db = await getDb();
    const config = await db
      .collection('app_config')
      .findOne({ key: 'update' });

    if (!config) return res.status(404).json({ error: 'No config found' });

    return res.status(200).json({
      latest_version_code: config.latest_version_code,
      latest_version:      config.latest_version,
      download_url:        config.download_url,
      force_update:        config.force_update ?? false,
      whats_new:           config.whats_new ?? '',
      banner_image_url:    config.banner_image_url ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}