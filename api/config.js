const { createClient } = require('@supabase/supabase-js');

const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Default config from env vars
  const defaultConfig = {
    coupleName: process.env.WEDDING_COUPLE_NAME || 'Our Wedding',
    weddingDate: process.env.WEDDING_DATE || '',
    maxShots: parseInt(process.env.WEDDING_MAX_SHOTS) || 50,
    welcomeMessage: process.env.WEDDING_WELCOME || 'Welcome to our wedding! 📸',
    subtitle: process.env.WEDDING_SUBTITLE || 'Capture your favorite moments',
  };

  if (req.method === 'GET') {
    let config = { ...defaultConfig };

    // Override with database values if available
    if (supabase) {
      try {
        const { data } = await supabase
          .from('config')
          .select('*')
          .eq('id', 'main')
          .single();

        if (data) {
          config.coupleName = data.couple_name || config.coupleName;
          config.weddingDate = data.wedding_date || config.weddingDate;
          config.maxShots = data.max_shots || config.maxShots;
          config.welcomeMessage = data.welcome_message || config.welcomeMessage;
          config.subtitle = data.subtitle || config.subtitle;
        }
      } catch (err) {
        // Table may not exist yet, use defaults
      }
    }

    return res.status(200).json(config);
  }

  if (req.method === 'PUT') {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    try {
      // Parse body - handle different body formats from Vercel
      let body = req.body;
      if (Buffer.isBuffer(body)) {
        body = JSON.parse(body.toString());
      } else if (typeof body === 'string') {
        body = JSON.parse(body);
      } else if (!body || typeof body !== 'object') {
        // Fallback: collect body from stream
        const chunks = [];
        await new Promise((resolve, reject) => {
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', resolve);
          req.on('error', reject);
        });
        body = JSON.parse(Buffer.concat(chunks).toString());
      }

      const { error } = await supabase
        .from('config')
        .upsert({
          id: 'main',
          couple_name: body.coupleName || defaultConfig.coupleName,
          wedding_date: body.weddingDate || defaultConfig.weddingDate,
          max_shots: body.maxShots || defaultConfig.maxShots,
          welcome_message: body.welcomeMessage || defaultConfig.welcomeMessage,
          subtitle: body.subtitle || defaultConfig.subtitle,
        });

      if (error) {
        console.error('Config save error:', error);
        return res.status(500).json({ error: 'Failed to save config' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Config PUT error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};