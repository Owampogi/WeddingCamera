// Load environment variables from .env file
try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Mount API routes from /api/*.js files
const apiFiles = [
  'config',
  'upload',
  'photos',
  'stats',
  'check-shots',
  'qrcode',
];

apiFiles.forEach(name => {
  const handler = require(`./api/${name}`);
  const route = `/api/${name}`;

  // Handle both Express-style (req, res, next) and Vercel-style exports
  if (typeof handler === 'function') {
    app.all(route, (req, res, next) => {
      // Set bodyParser config compatibility
      handler(req, res, next);
    });
  }
});

// Page routes
app.get('/camera', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'camera.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 Wedding Camera App is running!`);
  console.log(`\n📱 Guest Camera: http://localhost:${PORT}/camera`);
  console.log(`🖼️  Gallery:      http://localhost:${PORT}/gallery`);
  console.log(`⚙️  Admin:        http://localhost:${PORT}/admin`);
  console.log(`📋 QR Code:     http://localhost:${PORT}/api/qrcode`);

  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('your-project-id')) {
    console.log(`\n✅ Connected to Supabase: ${supabaseUrl}`);
  } else {
    console.log(`\n⚠️  Supabase not configured! Copy .env.example to .env and add your Supabase credentials.`);
    console.log(`   Photos will NOT upload until Supabase is set up.\n`);
  }
});