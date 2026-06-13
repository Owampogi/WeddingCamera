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
    let maxShots = parseInt(process.env.WEDDING_MAX_SHOTS) || 50;

    // Try to get maxShots from database config
    try {
      const { data: configData } = await supabase
        .from('config')
        .select('max_shots')
        .eq('id', 'main')
        .single();
      if (configData && configData.max_shots) {
        maxShots = configData.max_shots;
      }
    } catch (configErr) {
      // Config table may not exist, use env default
    }

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