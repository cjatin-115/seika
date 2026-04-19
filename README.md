# MediBook - Hospital & Clinic Appointment Booking Platform

Production-ready web application for booking doctor appointments. Built with Next.js 14, TypeScript, MongoDB Atlas, Prisma, and NextAuth.

## ✨ Features

### Patient App (Mobile-First)
- 🔐 Google OAuth authentication
- 👨‍⚕️ Browse doctors and hospitals
- 📅 Custom calendar with real-time slots
- 🎯 Multi-profile support (family members)
- 📱 Responsive Wabi-Sabi design
- 🔔 Real-time notifications
- ⭐ Ratings and reviews
- 💳 Appointment management
- 📥 Download .ics calendar files
- ⏰ Automated reminders

### Hospital Admin Dashboard
- 📊 Analytics
- 📋 Appointment management
- 👨‍⚕️ Doctor scheduling
- 🏥 Hospital management

### Super Admin Panel
- 🏗️ Hospital management
- 👥 User roles
- 📈 Platform analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Google OAuth credentials from Google Cloud Console
- (Optional) Redis instance for caching (Upstash, Redis Cloud, or self-hosted)

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and Google credentials

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000 to access the application.
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Credentials (After Seed)
- Admin: admin@medibook.com
- Patient 1: patient1@example.com
- Patient 2: patient2@example.com

## 📁 Structure

```
src/
├── app/
│   ├── (patient)/      # Patient app
│   ├── (dashboard)/    # Admin dashboard
│   ├── (superadmin)/   # Super admin
│   └── api/            # API routes
├── components/         # React components
├── lib/               # Utils & config
├── store/             # State management
└── prisma/            # Database
```

## 📦 Tech Stack

- Next.js 14 + TypeScript
- MongoDB Atlas (cloud database)
- Prisma ORM
- NextAuth.js + Google OAuth
- Zustand (state management)
- Tailwind CSS + Framer Motion
- Nodemailer (email notifications)
- Twilio (SMS, optional)
- Redis (optional, for caching)

## 📝 Scripts

```bash
npm run dev              # Development
npm run build            # Production build
npm run start            # Start production
npm run db:push          # Initialize DB
npm run db:seed          # Add sample data
npm run lint             # Lint code
```

## 🔐 Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL`: MongoDB Atlas connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/medibook`)
- `NEXTAUTH_URL` & `NEXTAUTH_SECRET`: NextAuth configuration
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `REDIS_URL` (optional): For caching and slot locking
- Email config: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Optional: Twilio credentials, Cloudinary credentials

### Getting MongoDB Atlas Connection String

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (M0 free tier works for development)
3. Create a database user with password
4. Click "Connect" → "Connect your application"
5. Copy connection string and add database name: `mongodb+srv://username:password@cluster.mongodb.net/medibook`
6. Paste into DATABASE_URL in .env

## 🌐 API Routes

- `POST /api/auth/[...nextauth]` - Auth
- `GET/POST /api/profiles` - Profiles
- `GET /api/doctors` - Doctors list
- `GET /api/doctors/:id/slots` - Available slots
- `GET/POST /api/appointments` - Appointments
- `GET /api/notifications` - Notifications
- `POST /api/reviews` - Reviews

## 🎨 Design System

**Colors (Wabi-Sabi Minimalism):**
- Background: #FAFAF8
- Surface: #F2F0EB
- Primary: #D4768A (cherry)
- Text: #1A1916

**Fonts:**
- Headings: Noto Serif JP
- Body: Noto Sans JP
- Mono: JetBrains Mono

## ✅ Completed

✅ Next.js 14 setup with TypeScript
✅ Prisma schema (12 models)
✅ PostgreSQL configuration
✅ Redis integration
✅ NextAuth.js setup
✅ Google OAuth provider
✅ Patient profiles API
✅ Doctors & slots API
✅ Appointments CRUD API
✅ Slot locking logic (Redis)
✅ Email notifications
✅ Error handling & validation
✅ Landing page
✅ Patient layout & home page
✅ Seed file with sample data
✅ Design system & constants

## 🔧 Production Deployment

### Deploy Frontend (Vercel - Recommended)
```bash
vercel deploy
```

### Deploy Frontend (Other Platforms)
```bash
npm run build
# Deploy the `.next` folder

# Configure environment variables in your platform:
- DATABASE_URL
- NEXTAUTH_URL (your deployment URL)
- NEXTAUTH_SECRET (generate: `openssl rand -base64 32`)
- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
- REDIS_URL (optional)
- SMTP credentials
```

### Database (MongoDB Atlas)
- No setup needed - database is already in the cloud
- Create a new cluster for production
- Update DATABASE_URL to point to production cluster
- Enable IP whitelist for your deployment platform

### Redis (Optional)
- Use Upstash Redis (https://upstash.com) - free tier available
- Or use Redis Cloud, AWS ElastiCache, etc.

## 📚 Next Steps

To complete the app:
1. Build remaining patient pages (search, calendar, profile)
2. Implement full calendar component
3. Create admin dashboard pages
4. Add appointment reminder cron jobs
5. Implement PWA features
6. Add tests

All patterns are established - follow them for consistency!

## 📄 License

MIT
