# Personal Website - Next.js & React

A modern, responsive personal website built with Next.js, React, TypeScript, and Tailwind CSS, featuring a full-stack blog CMS, Supabase authentication, and PostgreSQL database.

## ✨ Features

### 🎨 Modern Tech Stack
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Prisma ORM** with PostgreSQL
- **Supabase** for authentication and database
- **Framer Motion** for animations
- **Lucide React** for icons

### 🔐 Authentication & Security
- Supabase authentication with email/password
- Protected admin routes with server-side auth checks
- Secure session management with cookies
- Logout functionality

### 📝 Full-Stack Blog CMS
- Create, edit, and delete blog posts
- Rich text editor with excerpts
- Featured images with alt text support
- Tag system for categorization
- Draft and publish workflow
- PostgreSQL database storage
- Real-time preview and editing

### 📊 Analytics & Engagement
- Page view tracking
- Post view analytics
- Visitor insights
- Admin analytics dashboard

### 📧 Contact Management
- Professional contact form with validation
- Contact submission management
- Admin panel for viewing submissions
- Spam prevention with IP tracking

### 🎮 Hidden Easter Egg Game
- Classic Snake game with modern UI
- Keyboard controls (arrow keys + spacebar)
- Score tracking and game state management
- Accessible via game controller icon in footer

### 📱 Responsive Design
- **Hero Section**: Eye-catching introduction with social links
- **About**: Personal interests with animated icons
- **Accomplishments**: Project showcase with tags and links
- **Blog**: Full-featured blog with CMS
- **Contact**: Professional contact form
- **Admin Dashboard**: Complete content management system

### 🎭 Animations & Interactions
- Smooth scroll navigation
- Framer Motion page transitions
- Intersection Observer for scroll animations
- Hover effects and micro-interactions
- Loading states and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account ([sign up free](https://supabase.com))
- Git

### 1. Clone and Install

```bash
git clone https://github.com/Tcrowley128/TCrowleyPersonalSite.git
cd personal-website-nextjs
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Go to Project Settings → Database
5. Copy your database connection string

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL=your_supabase_database_url
```

### 4. Set Up Database

```bash
# Push Prisma schema to your database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Admin User

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Create an admin account with email/password
5. Use these credentials to log in at `/login`

## 🛠️ Customization

### Personal Information
Update the following components with your information:

- **Navigation & Hero**: `src/components/Navigation.tsx` and `src/components/Hero.tsx`
- **About Section**: `src/components/About.tsx`
- **Accomplishments**: `src/data/accomplishments.ts`
- **Contact Info**: `src/components/Contact.tsx`

### Design & Styling
- **Colors**: Modify `tailwind.config.js` for custom color palette
- **Fonts**: Update font imports in `src/app/globals.css`
- **Animations**: Customize Framer Motion settings in components

## 🎯 Hidden Game

Click the game controller emoji (🎮) in the footer to play Snake!

**Controls:**
- Arrow keys to move
- Spacebar to start/pause/restart
- Eat yellow food to grow and score points

## 📁 Project Structure

```
personal-website-nextjs/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes
│   │   ├── auth/            # Auth callback
│   │   ├── login/           # Login page
│   │   ├── globals.css      # Global styles
│   │   └── page.tsx         # Main page
│   ├── components/          # React components
│   │   ├── AdminLayout.tsx  # Admin panel layout
│   │   ├── Navigation.tsx   # Header with auth state
│   │   ├── Hero.tsx         # Hero section
│   │   ├── About.tsx        # About section
│   │   ├── Blog.tsx         # Blog display
│   │   ├── Contact.tsx      # Contact form
│   │   └── Footer.tsx       # Footer with game
│   ├── lib/
│   │   └── supabase/        # Supabase client utilities
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── data/                # Static data
├── .env.local               # Environment variables
├── middleware.ts            # Auth middleware
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Users**: Admin authentication and management
- **Posts**: Blog posts with tags, images, and analytics
- **Tags**: Categorization system
- **ContactSubmissions**: Contact form entries
- **PageViews**: Analytics tracking
- **PageMetadata**: SEO management
- **Redirects**: URL redirect management

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   Add these in Vercel → Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   DATABASE_URL=your_postgres_connection_string
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Each push to `main` triggers a new deployment

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

### Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Database schema pushed to Supabase
- [ ] Admin user created in Supabase Auth
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

## 📝 Admin Panel

Access the admin panel at `/admin` (requires authentication):

- **Dashboard**: Overview with quick navigation
- **Blog Management**: Create, edit, publish posts
- **Analytics**: View site and post statistics
- **Contact Forms**: Manage submissions
- **SEO Manager**: Configure metadata

## 🔒 Security Features

- Server-side authentication checks
- Protected API routes
- Secure session management
- CSRF protection
- SQL injection prevention (via Prisma)
- XSS protection
- Security headers configured

## 🤝 Contributing

This is a personal website project, but suggestions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide](https://lucide.dev/)

---

**Built with ❤️ using Next.js, React, and modern web technologies.**

**Live Site**: [tylercrowley.com](https://tylercrowley.com)
