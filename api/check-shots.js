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
    const deviceId = req.query.deviceId || 'unknown';
    const maxShots = parseInt(process.env.WEDDING_MAX_SHOTS) || 50;

    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId);

    const shotsUsed = count || 0;

    return res.status(200).json({
      shotsUsed,
      shotsRemaining: maxShots - shotsUsed,
      maxShots,
    });
  } catch (err) {
    console.error('Check shots error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};