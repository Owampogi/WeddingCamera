const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Use VERCEL_URL if available, otherwise use custom domain
    const baseUrl = process.env.WEDDING_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
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