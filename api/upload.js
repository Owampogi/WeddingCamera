const { createClient } = require('@supabase/supabase-js');
const Busboy = require('busboy');

const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const BUCKET = process.env.SUPABASE_BUCKET || 'wedding-photos';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file.' });
  }

  try {
    // Parse multipart form data using busboy
    const { fields, fileBuffer, fileName: uploadFileName, contentType } = await new Promise((resolve, reject) => {
      const fields = {};
      let fileBuffer = null;
      let uploadFileName = 'photo.jpg';
      let contentType = 'image/jpeg';

      const bb = Busboy({ headers: req.headers });

      bb.on('field', (name, val) => {
        fields[name] = val;
      });

      bb.on('file', (name, info) => {
        const chunks = [];
        uploadFileName = info.filename || 'photo.jpg';
        contentType = info.mimeType || 'image/jpeg';

        info.on('data', (chunk) => chunks.push(chunk));
        info.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('close', () => {
        resolve({ fields, fileBuffer, fileName: uploadFileName, contentType });
      });

      bb.on('error', (err) => reject(err));

      req.pipe(bb);
    });

    const deviceId = fields.deviceId || 'unknown';
    const guestName = fields.guestName || 'Anonymous';
    const timestamp = fields.timestamp || new Date().toISOString();

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Check shot limit
    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId);

    const maxShots = parseInt(process.env.WEDDING_MAX_SHOTS) || 50;

    if (count >= maxShots) {
      return res.status(403).json({
        error: 'No shots remaining',
        shotsRemaining: 0,
      });
    }

    // Generate unique filename
    const photoId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const ext = uploadFileName.split('.').pop() || 'jpg';
    const storageFileName = `${deviceId}/${photoId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageFileName, fileBuffer, {
        contentType: contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Upload failed', details: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storageFileName);

    const publicUrl = urlData.publicUrl;

    // Save metadata to database
    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        device_id: deviceId,
        guest_name: guestName,
        photo_url: publicUrl,
        file_name: storageFileName,
        timestamp: timestamp,
      });

    if (dbError) {
      console.error('DB error:', dbError);
      // Don't fail - photo is uploaded, just metadata failed
    }

    const shotsUsed = (count || 0) + 1;
    const shotsRemaining = maxShots - shotsUsed;

    return res.status(200).json({
      success: true,
      photoId: photoId,
      url: publicUrl,
      shotsUsed,
      shotsRemaining,
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};