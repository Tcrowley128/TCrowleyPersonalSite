# Production Deployment Guide

Complete guide to deploy your personal website to production with Vercel, GitHub, and Supabase.

## 📋 Overview

**Stack:**
- **Frontend/Backend**: Next.js 15
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Version Control**: GitHub
- **Domain**: Your custom domain (when ready)

**Environments:**
- **Development**: Local (SQLite)
- **Production**: Vercel + Supabase (PostgreSQL)

---

## 🎯 Pre-Deployment Checklist

### 1. Local Preparation
- [ ] All features working locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Tests passing (if any)
- [ ] No sensitive data in code

### 2. Accounts Needed
- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] Supabase account (free tier is fine)
- [ ] Domain registrar account (optional, for custom domain)

---

## 📦 Part 1: GitHub Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository Settings**:
   - Name: `personal-website` (or your choice)
   - Description: "Personal website with blog, contact form, and analytics"
   - Visibility: Private (recommended) or Public
   - **Don't** initialize with README (we already have files)

3. **Click "Create repository"**

### Step 2: Initialize Git Locally

Open your terminal in the project directory:

```bash
cd "C:\Users\tcrow\OneDrive\Desktop\Application\personal-website-nextjs"

# Initialize git if not already done
git init

# Create .gitignore if it doesn't exist (it should already exist)
# Verify .gitignore includes:
# - node_modules/
# - .env
# - .env.local
# - .next/
# - prisma/*.db
# - prisma/*.db-journal

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Personal website with blog, contact, analytics, and SEO features"

# Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify GitHub

- Go to your repository on GitHub
- You should see all your files (except those in .gitignore)
- Verify `.env` files are NOT uploaded (security)

---

## 🐘 Part 2: Supabase Setup

### Step 1: Create Supabase Project

1. **Go to Supabase**: https://supabase.com
2. **Sign up / Login**
3. **Create New Project**:
   - Name: `personal-website-prod` (or your choice)
   - Database Password: **Generate strong password** (save this!)
   - Region: Choose closest to your target audience (e.g., US East, Europe West)
   - Pricing Plan: Free (sufficient for personal websites)

4. **Wait 2-3 minutes** for project provisioning

### Step 2: Get Database Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Find **Connection string** section
3. Select **Connection string** tab
4. Copy the connection string (looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. **Replace `[YOUR-PASSWORD]`** with your actual database password

### Step 3: Update Database for PostgreSQL

Your app currently uses SQLite. We need to switch to PostgreSQL for production.

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 4: Create Migration for PostgreSQL

```bash
# Delete existing migrations (SQLite-specific)
rm -rf prisma/migrations

# Generate new migration for PostgreSQL
# First, update your DATABASE_URL in .env.local to Supabase URL
# Then run:
npx prisma migrate dev --name init
```

**Note**: You'll do this again in production with proper env vars.

---

## 🚀 Part 3: Vercel Deployment

### Step 1: Connect Vercel to GitHub

1. **Go to Vercel**: https://vercel.com
2. **Sign up / Login** (use GitHub account for easy integration)
3. **Click "Add New Project"**
4. **Import Git Repository**:
   - Select your GitHub account
   - Find your `personal-website` repository
   - Click "Import"

### Step 2: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (default)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

### Step 3: Environment Variables

Click **Environment Variables** and add these:

#### Required Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your Supabase connection string | From Supabase Settings → Database |
| `NODE_ENV` | `production` | Tells app it's in production |
| `NEXT_PUBLIC_APP_URL` | `https://your-site.vercel.app` | Your Vercel URL (update after first deploy) |

#### Optional (if using email features):

| Variable | Value | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | Your Resend API key | For sending emails |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Sender email address |

#### Auth Variables (when you add authentication):

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_SECRET` | Generate random string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | Same as NEXT_PUBLIC_APP_URL |

### Step 4: Deploy

1. **Click "Deploy"**
2. Wait 2-3 minutes for build
3. If successful, you'll get a URL like: `https://personal-website-xxx.vercel.app`

### Step 5: Run Database Migration

After first deployment, you need to set up the database:

**Option A: Vercel CLI** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Supabase SQL Editor**

1. Go to Supabase → SQL Editor
2. Run the migration SQL manually (copy from `prisma/migrations/`)

### Step 6: Seed Production Database

```bash
# Using Vercel CLI with production env
vercel env pull .env.production
npx prisma db seed
```

Or update your seed script to handle production.

---

## 🔒 Part 4: Security Configuration

### 1. Update CORS and Security Headers

Create `next.config.ts` security headers:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 2. Environment Variable Security

**Never commit:**
- `.env`
- `.env.local`
- `.env.production`
- Database credentials
- API keys

**Verify `.gitignore` includes:**
```
.env
.env*.local
.env.production
```

### 3. API Route Protection

All admin API routes should check authentication:

```typescript
// Example middleware
export async function middleware(request: NextRequest) {
  // Check auth token
  const token = request.cookies.get('auth-token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

### 4. Rate Limiting

Consider adding rate limiting for:
- Contact form submissions
- Blog post creation
- API endpoints

Use services like:
- Vercel Edge Config
- Upstash Redis
- Cloudflare

---

## 🌐 Part 5: Custom Domain Setup

### When You Get Your Domain:

1. **In Vercel**:
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `tylercrowley.com`)
   - Follow DNS configuration instructions

2. **In Your Domain Registrar** (GoDaddy, Namecheap, etc.):
   - Add DNS records as shown by Vercel
   - Typically:
     - Type: A, Name: @, Value: 76.76.21.21
     - Type: CNAME, Name: www, Value: cname.vercel-dns.com

3. **SSL Certificate**:
   - Vercel automatically provisions SSL
   - Wait 24-48 hours for DNS propagation
   - Your site will be accessible via HTTPS

4. **Update Environment Variables**:
   - `NEXT_PUBLIC_APP_URL` → `https://yourdomain.com`
   - `NEXTAUTH_URL` → `https://yourdomain.com`

---

## 🔄 Part 6: Deployment Workflow

### Development Workflow:

```bash
# Make changes locally
# Test thoroughly

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Vercel automatically deploys!
```

### Branch-Based Deployments:

**Production** (main branch):
```bash
git push origin main
# → Deploys to yourdomain.com
```

**Preview** (feature branches):
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# → Vercel creates preview URL
```

### Rollback:

If something breaks:
1. Go to Vercel → Deployments
2. Find the last working deployment
3. Click "Promote to Production"

---

## 📊 Part 7: Monitoring & Analytics

### Vercel Analytics

1. Go to Vercel project → Analytics
2. Enable Analytics (free tier available)
3. See real-time visitor data

### Error Tracking

Consider integrating:
- **Sentry**: Error monitoring
- **LogRocket**: Session replay
- **Datadog**: Performance monitoring

### Database Monitoring

Supabase provides:
- Query performance
- Database size
- Connection pooling stats
- Real-time dashboard

---

## 🧪 Part 8: Testing Checklist

### Before Going Live:

- [ ] Test all pages load correctly
- [ ] Contact form works and saves to database
- [ ] Blog posts display properly
- [ ] Admin panel is accessible (with auth)
- [ ] Analytics tracking works
- [ ] SEO metadata appears correctly
- [ ] Images load properly
- [ ] Mobile responsive design works
- [ ] Forms validate correctly
- [ ] Error pages work (404, 500)

### Performance Tests:

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Check on multiple devices
- [ ] Test on slow 3G network

---

## 🆘 Troubleshooting

### Common Issues:

**1. Build Fails on Vercel**
```bash
# Check build logs
# Usually missing dependencies or type errors

# Test build locally:
npm run build
```

**2. Database Connection Fails**
```bash
# Verify DATABASE_URL is correct
# Check Supabase is not paused (free tier)
# Verify IP whitelist (Supabase allows all by default)
```

**3. Environment Variables Not Working**
```bash
# Redeploy after adding env vars
# Verify variable names match exactly
# Check spelling and case sensitivity
```

**4. Prisma Migration Fails**
```bash
# Reset database (CAUTION: deletes data)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

---

## 📚 Additional Resources

### Documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### Useful Tools:
- **Vercel CLI**: `npm i -g vercel`
- **Prisma Studio**: `npx prisma studio`
- **Database GUI**: TablePlus, DBeaver

### Support:
- Vercel Discord
- Supabase Discord
- GitHub Issues

---

## 🎉 Next Steps

After deployment:
1. Test everything thoroughly
2. Monitor for errors
3. Set up email notifications
4. Add real authentication (NextAuth, Clerk, etc.)
5. Implement proper admin role checking
6. Add monitoring and analytics
7. Set up automated backups
8. Create custom 404/500 pages
9. Optimize images with next/image
10. Add sitemap and robots.txt

---

**Your site is now ready for production! 🚀**
