-- ============================================
-- Wedding Camera App - Supabase Setup
-- ============================================
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================

-- 1. Create the photos table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  guest_name TEXT DEFAULT 'Anonymous',
  photo_url TEXT NOT NULL,
  file_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_photos_device_id ON photos(device_id);
CREATE INDEX IF NOT EXISTS idx_photos_timestamp ON photos(timestamp DESC);

-- 3. Create the config table (for admin settings)
CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY,
  couple_name TEXT,
  wedding_date TEXT,
  max_shots INTEGER DEFAULT 50,
  welcome_message TEXT,
  subtitle TEXT
);

-- 4. Insert default config row
INSERT INTO config (id, couple_name, max_shots, welcome_message, subtitle)
VALUES ('main', 'Our Wedding', 50, 'Welcome to our wedding! 📸', 'Capture your favorite moments')
ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS) but allow all access
-- (Since we use service key on the server, this is safe)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to photos (for gallery)
CREATE POLICY "Public read photos" ON photos
  FOR SELECT USING (true);

-- Allow public insert to photos (for uploads)
CREATE POLICY "Public insert photos" ON photos
  FOR INSERT WITH CHECK (true);

-- Allow public delete on photos (for admin)
CREATE POLICY "Public delete photos" ON photos
  FOR DELETE USING (true);

-- Allow public read/write on config
CREATE POLICY "Public read config" ON config
  FOR SELECT USING (true);

CREATE POLICY "Public upsert config" ON config
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update config" ON config
  FOR UPDATE USING (true);

-- 6. Create the storage bucket
-- Run this in the SQL Editor or create manually in Storage tab
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Allow public access to the storage bucket
CREATE POLICY "Public read storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public insert storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Public delete storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'wedding-photos');

-- ============================================
-- DONE! Your Supabase project is ready.
-- Next: Copy your SUPABASE_URL and SUPABASE_SERVICE_KEY
-- from Settings → API in your Supabase dashboard.
-- ============================================