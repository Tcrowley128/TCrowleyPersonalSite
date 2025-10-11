# Database Features Implementation

This document outlines the new database features added to your personal website.

## 🎯 Features Implemented

### 1. Analytics & Engagement

#### Database Models
- **PageView**: Tracks all page visits with path, title, referrer, user agent, and IP
- **PostView**: Tracks blog post views with duplicate prevention (1 hour window per IP)

#### API Endpoints
- `POST /api/analytics/page-views` - Track a page view
- `GET /api/analytics/page-views?days=30` - Get page view statistics
- `POST /api/analytics/post-views` - Track a blog post view
- `GET /api/analytics/post-views` - Get popular posts

#### Features
- Automatic page view tracking on all pages
- Blog post view tracking with duplicate prevention
- Analytics dashboard at `/admin/analytics`
- View statistics by time range (7, 30, 90 days)
- Top pages and popular posts ranking

### 2. Contact Form Enhancement

#### Database Model
- **ContactSubmission**: Stores all contact form submissions with status tracking

#### API Endpoints
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all submissions (admin)
- `PATCH /api/contact` - Update submission status (admin)

#### Features
- Contact form submissions saved to database
- Spam prevention (max 3 submissions per 5 minutes per IP)
- Email validation
- Status tracking (NEW, READ, RESPONDED, SPAM, ARCHIVED)
- Admin notes support
- Response tracking

#### Contact Form Fields
- Name (required)
- Email (required)
- Subject (optional)
- Message (required)

### 3. SEO & Metadata Management

#### Database Models
- **PageMetadata**: Stores SEO metadata for each page
- **Redirect**: Manages URL redirects (301/302)

#### API Endpoints

**Metadata:**
- `GET /api/seo/metadata?path=/about` - Get metadata for a page
- `GET /api/seo/metadata` - Get all metadata
- `POST /api/seo/metadata` - Create/update metadata
- `DELETE /api/seo/metadata?path=/about` - Delete metadata

**Redirects:**
- `GET /api/seo/redirects` - Get all redirects
- `POST /api/seo/redirects` - Create redirect
- `PATCH /api/seo/redirects` - Update redirect
- `DELETE /api/seo/redirects?id=xxx` - Delete redirect

#### Features
- SEO management dashboard at `/admin/seo`
- Manage page titles, descriptions, and keywords
- Open Graph tags support
- Twitter Card configuration
- noIndex/noFollow options
- Canonical URLs
- URL redirect management
- Character count helpers (title: 60, description: 160)

## 📊 Admin Dashboard

Access the admin features at:
- `/admin/analytics` - Analytics dashboard
- `/admin/seo` - SEO metadata management
- `/admin` - Main admin panel (existing)

## 🔐 Authentication

**Note:** The API routes include TODO comments for authentication checks. You should add proper authentication before deploying to production.

Default admin credentials (from seed):
- Email: admin@example.com
- Password: admin123

## 🗄️ Database Schema

### New Tables
- `page_views` - Page view tracking
- `post_views` - Blog post view tracking
- `contact_submissions` - Contact form submissions
- `page_metadata` - SEO metadata per page
- `redirects` - URL redirects

### Relationships
- `Post` has many `PostView`
- Contact submissions are independent
- Page metadata is unique per path

## 🚀 Usage Examples

### Tracking Page Views
Page views are automatically tracked on all pages via the `PageViewTracker` component in the root layout.

### Tracking Blog Post Views
```typescript
import { trackPostView } from '@/lib/analytics';

// After fetching a post
trackPostView(postId);
```

### Submitting Contact Form
The contact form component automatically saves to the database when submitted.

### Managing SEO Metadata
1. Go to `/admin/seo`
2. Click "Add Metadata"
3. Fill in page path (e.g., `/about`)
4. Enter title, description, and other fields
5. Save

## 📈 Sample Data

The seed file creates:
- Sample SEO metadata for home, about, and blog pages
- Sample page views for analytics demo
- Sample blog post views
- Default admin user

Run seed: `npm run db:seed`

## 🛠️ Technical Details

### Analytics Privacy
- IP addresses are stored for duplicate prevention and spam protection
- Consider anonymizing IPs in production (hash or partial masking)
- Consider GDPR compliance if targeting EU users

### Performance
- Indexes added on frequently queried fields:
  - `page_views`: path + createdAt, createdAt
  - `post_views`: postId + createdAt
  - `contact_submissions`: status + createdAt, email
  - `page_metadata`: path (unique)
  - `redirects`: fromPath (unique)

### Future Enhancements
- Email notifications for contact submissions
- Advanced analytics (charts, graphs)
- Export analytics data
- A/B testing support
- Sitemap generation from PageMetadata
- Automatic redirect handling in middleware
- Contact form honeypot for spam prevention
- Rate limiting per user session

## 🔍 Files Modified/Created

### API Routes
- `src/app/api/analytics/page-views/route.ts`
- `src/app/api/analytics/post-views/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/seo/metadata/route.ts`
- `src/app/api/seo/redirects/route.ts`

### Components
- `src/components/Contact.tsx` (updated)
- `src/components/PageViewTracker.tsx` (new)

### Pages
- `src/app/admin/analytics/page.tsx`
- `src/app/admin/seo/page.tsx`
- `src/app/blog/[slug]/page.tsx` (updated)
- `src/app/layout.tsx` (updated)

### Utilities
- `src/lib/analytics.ts`

### Database
- `prisma/schema.prisma` (updated)
- `prisma/seed.ts` (updated)
- `prisma/migrations/*/migration.sql` (new)

## 📝 Notes

All features are fully functional and ready to use. Remember to:
1. Add authentication to admin routes before production
2. Configure email service for contact notifications
3. Test analytics tracking in production environment
4. Review privacy policy for analytics tracking
5. Consider adding CAPTCHA to contact form
