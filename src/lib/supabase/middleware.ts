import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Don't JUST call getUser - also verify session exists in cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = ['/admin', '/assessment', '/projects'];
  const adminRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Protect routes - redirect to login if no session
  if (isProtectedRoute) {
    console.log('🔒 Middleware checking protected route:', request.nextUrl.pathname);
    console.log('Session exists:', !!session);

    if (!session) {
      console.log('❌ No session - redirecting to /login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Double-check the user is valid
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('User exists:', !!user, 'Error:', error?.message);

    if (!user || error) {
      console.log('❌ No user or error - redirecting to /login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Check if this is an admin route and restrict to admin email only
    if (isAdminRoute) {
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminEmail) {
        console.error('⚠️ ADMIN_EMAIL not configured in environment variables');
      }

      if (adminEmail && user.email !== adminEmail) {
        console.log('❌ Non-admin user trying to access admin route - redirecting to home');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }

    console.log('✅ Access granted to', request.nextUrl.pathname);
  }

  return supabaseResponse;
}
