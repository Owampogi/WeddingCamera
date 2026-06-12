# 📸 Wedding Camera App

A web-based camera app for wedding guests. Guests scan a QR code, access their phone camera, and take up to 50 photos that are automatically uploaded to a shared gallery visible on your wedding website.

## ✨ Features

- **QR Code Access** — Guests scan a QR code to open the camera app
- **50 Shots Per Guest** — Configurable shot limit per device
- **Direct Upload** — Photos upload to Supabase cloud storage (free)
- **Live Gallery** — Auto-refreshing photo gallery with lightbox viewer
- **Guest Names** — Guests enter their name before taking photos
- **Admin Panel** — Manage settings, view stats, delete photos
- **Mobile-Optimized** — Works on any phone with a browser
- **PWA Support** — Installable as an app on guest phones
- **No App Install** — Just scan and shoot, nothing to download
- **Client-side Compression** — Photos compressed before upload for fast transfers

## 🚀 Quick Start

### 1. Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase-setup.sql`
4. Go to **Storage** and verify the `wedding-photos` bucket exists and is public
5. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **Service Role Key** (the `service_role` secret key)

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

3. Customize wedding settings:
   ```
   WEDDING_COUPLE_NAME=John & Jane
   WEDDING_DATE=December 25, 2026
   WEDDING_MAX_SHOTS=50
   ```

### 3. Deploy to Vercel (Free)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login and deploy:
   ```bash
   vercel login
   vercel --prod
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and all wedding settings

### 4. Generate QR Code

1. Visit `https://your-app.vercel.app/admin`
2. Click the **QR Code** tab
3. Print or display the QR code at your wedding venue

## 📁 Project Structure

```
wedding-camera/
├── api/                    # Vercel serverless functions
│   ├── upload.js          # Photo upload to Supabase Storage
│   ├── photos.js          # List/delete photos
│   ├── config.js          # Wedding configuration (persisted in Supabase)
│   ├── stats.js           # Photo & guest statistics
│   ├── qrcode.js          # QR code generation
│   └── check-shots.js     # Check remaining shots per device
├── public/                 # Static frontend files
│   ├── index.html         # Landing page
│   ├── camera.html        # Guest camera app (PWA)
│   ├── gallery.html       # Photo gallery with lightbox
│   ├── admin.html         # Admin panel
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── server.js               # Local dev server
├── supabase-setup.sql      # Database setup script
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── .env.example            # Environment variables template
```

## 🔧 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   copy .env.example .env
   ```

3. Start the local server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser

## 📱 How It Works for Guests

1. Guest scans QR code with phone camera
2. Browser opens the camera app (`/camera`)
3. Guest enters their name (optional)
4. Camera opens with a viewfinder
5. Guest taps the capture button (up to 50 times)
6. Photos are compressed and upload instantly to cloud storage
7. Photos appear in the gallery (`/gallery`) in real-time

## ⚙️ Configuration

All settings are configured via environment variables (Vercel dashboard or `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | Required |
| `SUPABASE_BUCKET` | Storage bucket name | `wedding-photos` |
| `WEDDING_COUPLE_NAME` | Names displayed on pages | `Our Wedding` |
| `WEDDING_DATE` | Wedding date display text | Empty |
| `WEDDING_MAX_SHOTS` | Photos per guest device | `50` |
| `WEDDING_WELCOME` | Camera page welcome message | `Welcome to our wedding! 📸` |
| `WEDDING_SUBTITLE` | Camera page subtitle | `Capture your favorite moments` |
| `WEDDING_URL` | Your deployed app URL | Auto-detected |

## 🌐 URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page |
| Camera | `/camera` | Guest camera app |
| Gallery | `/gallery` | Photo gallery |
| Admin | `/admin` | Admin panel |

## 💰 Cost

This app is **completely free** to run:

- **Vercel**: Free tier (100GB bandwidth/month)
- **Supabase**: Free tier (1GB storage, 50K monthly active users)
- **Database**: Supabase PostgreSQL (free, 500MB)

With client-side compression (~300KB per photo), 1GB storage fits ~3,300 photos — more than enough for most weddings. For larger events, Supabase Pro ($25/mo) gives 100GB storage.

## 🔒 Privacy Notes

- Photos are stored in your private Supabase project
- No guest data is collected beyond their self-entered name
- Device IDs are random and don't identify actual devices
- You can delete any photo from the admin panel
- Photos can be bulk-downloaded after the event

## 📋 Wedding Day Checklist

- [ ] Test the app on your phone before the event
- [ ] Print QR codes for each table
- [ ] Ensure venue has WiFi or good cell signal
- [ ] Consider setting up a backup phone hotspot
- [ ] Display the gallery URL on a screen at the venue
- [ ] Download all photos after the event as a backup

## License

MIT — Use freely for your special day! 💒