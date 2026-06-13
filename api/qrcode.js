const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Use WEDDING_URL if set, then VERCEL_PROJECT_PRODUCTION_URL, then derive from VERCEL_URL
    let baseUrl;
    if (process.env.WEDDING_URL) {
      baseUrl = process.env.WEDDING_URL;
    } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      // Vercel's built-in production URL variable
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (process.env.VERCEL_URL) {
      // Fallback: try to strip preview hash to get production URL
      const vercelUrl = process.env.VERCEL_URL;
      const match = vercelUrl.match(/^(.+?)-[a-zA-Z0-9]{8,}-.+\.vercel\.app$/);
      if (match) {
        baseUrl = `https://${match[1]}.vercel.app`;
      } else {
        baseUrl = `https://${vercelUrl}`;
      }
    } else {
      baseUrl = 'http://localhost:3000';
    }
    const cameraUrl = `${baseUrl}/camera`;

    const qrCode = await QRCode.toDataURL(cameraUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    res.status(200).json({
      url: cameraUrl,
      qrCode: qrCode,
    });
  } catch (error) {
    console.error('QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};