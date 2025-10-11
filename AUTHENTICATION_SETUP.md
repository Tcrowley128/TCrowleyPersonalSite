# Authentication Setup Guide

Guide to add proper authentication to your website for production.

## 🎯 Why Authentication?

Currently, your admin panel uses localStorage for access control. This is fine for development but **NOT secure for production**. You need:

- ✅ Secure login/logout
- ✅ Password protection
- ✅ Session management
- ✅ Role-based access control
- ✅ Protection against unauthorized access

---

## 📦 Recommended Solutions

### Option 1: NextAuth.js (Recommended for Next.js)

**Pros:**
- Built specifically for Next.js
- Free and open-source
- Supports multiple providers (Google, GitHub, Email)
- Easy to set up
- Good documentation

**Cons:**
- Requires some setup
- Need to manage sessions

**Best for:** Full control, multiple auth providers

### Option 2: Clerk (Easiest)

**Pros:**
- Drop-in solution
- Beautiful pre-built UI
- User management dashboard
- Social logins included
- Free tier available

**Cons:**
- Free tier limits (5,000 monthly active users)
- Less customizable
- Hosted service dependency

**Best for:** Quick setup, beautiful UI out of the box

### Option 3: Supabase Auth

**Pros:**
- Integrated with your database
- Built-in user management
- Row-level security
- Magic links, social auth

**Cons:**
- Tied to Supabase
- Learning curve for RLS policies

**Best for:** Already using Supabase, want integrated solution

---

## 🚀 Implementation: NextAuth.js

### Step 1: Install NextAuth

```bash
npm install next-auth
```

### Step 2: Create Auth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
```

### Step 3: Create Login Page

Create `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Step 4: Protect Admin Routes

Create `middleware.ts` in root:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Check if user has admin role
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/unauthorized', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
```

### Step 5: Update Navigation

Update `src/components/Navigation.tsx`:

```typescript
import { useSession } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Rest of your navigation code...
  // The isAdmin check now uses session instead of localStorage
}
```

### Step 6: Add Environment Variables

Add to `.env.local` and Vercel:

```bash
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# In production (Vercel):
NEXTAUTH_URL="https://yourdomain.com"
```

### Step 7: Create Initial Admin User

Update `prisma/seed.ts` to use the hashed password:

```typescript
const hashedPassword = await bcrypt.hash('YourSecurePassword123!', 10);

const user = await prisma.user.upsert({
  where: { email: 'your-email@gmail.com' },
  update: {},
  create: {
    email: 'your-email@gmail.com',
    password: hashedPassword,
    name: 'Tyler Crowley',
    role: 'ADMIN',
  },
});
```

---

## 🔒 Security Best Practices

### 1. Password Requirements

Enforce strong passwords:
- Minimum 8 characters
- Include uppercase, lowercase, numbers, special characters
- Use a library like `zxcvbn` for password strength checking

### 2. Rate Limiting

Add rate limiting to login endpoint:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
});
```

### 3. HTTPS Only

Ensure all production traffic uses HTTPS:
- Vercel provides this automatically
- Set secure cookie flags in NextAuth config

### 4. Session Management

Configure secure sessions:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60, // 24 hours
  updateAge: 60 * 60, // 1 hour
},
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

### 5. Two-Factor Authentication (Optional)

For extra security, consider adding 2FA:
- Use `next-auth` with TOTP provider
- Or integrate with Auth0, Clerk which have 2FA built-in

---

## 🧪 Testing Authentication

### Test Checklist:

- [ ] Can log in with correct credentials
- [ ] Cannot log in with wrong credentials
- [ ] Admin routes redirect to login when not authenticated
- [ ] Session persists across page refreshes
- [ ] Logout works correctly
- [ ] Session expires after timeout
- [ ] Admin navigation only shows when authenticated
- [ ] API routes check authentication
- [ ] Rate limiting works (try 6 failed attempts)

---

## 🚀 Deployment Steps

1. **Add NextAuth secret to Vercel**:
   ```bash
   # Generate secret
   openssl rand -base64 32

   # Add to Vercel env vars
   NEXTAUTH_SECRET=<your-secret>
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add NextAuth authentication"
   git push origin main
   ```

3. **Create admin user in production**:
   ```bash
   vercel env pull .env.production
   npx prisma db seed
   ```

4. **Test login**:
   - Go to `https://yourdomain.com/login`
   - Login with seeded credentials
   - Access `/admin`

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Your admin panel will now be secure with proper authentication! 🔒**
