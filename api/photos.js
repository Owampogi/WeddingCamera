const { createClient } = require('@supabase/supabase-js');

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const BUCKET = process.env.SUPABASE_BUCKET || 'wedding-photos';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Fetch photos error:', error);
        return res.status(500).json({ error: 'Failed to fetch photos' });
      }

      const photos = (data || []).map(row => ({
        id: row.id,
        url: row.photo_url,
        thumbnail: row.photo_url,
        guestName: row.guest_name,
        deviceId: row.device_id,
        timestamp: row.timestamp,
      }));

      return res.status(200).json(photos);
    } catch (err) {
      console.error('Photos GET error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      const photoId = req.query.id;

      if (!photoId) {
        return res.status(400).json({ error: 'Photo ID required' });
      }

      // Get photo record to find file
      const { data: photo, error: fetchError } = await supabase
        .from('photos')
        .select('file_name')
        .eq('id', photoId)
        .single();

      if (fetchError || !photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      // Delete from storage
      if (photo.file_name) {
        await supabase.storage
          .from(BUCKET)
          .remove([photo.file_name]);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete photo' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Photos DELETE error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};