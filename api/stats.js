const { createClient } = require('@supabase/supabase-js');

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    // Get total photos count
    const { count: totalPhotos } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });

    // Get unique devices count
    const { data: deviceData } = await supabase
      .from('photos')
      .select('device_id');

    const uniqueDevices = new Set((deviceData || []).map(r => r.device_id)).size;

    const maxShots = parseInt(process.env.WEDDING_MAX_SHOTS) || 50;

    return res.status(200).json({
      totalPhotos: totalPhotos || 0,
      totalDevices: uniqueDevices || 0,
      maxShotsPerDevice: maxShots,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};