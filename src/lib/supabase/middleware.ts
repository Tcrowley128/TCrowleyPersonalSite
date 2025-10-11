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

  // Protect admin routes - redirect to login if no session
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Middleware checking /admin route');
    console.log('Session exists:', !!session);

    if (!session) {
      console.log('❌ No session - redirecting to /login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Double-check the user is valid
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('User exists:', !!user, 'Error:', error?.message);

    if (!user || error) {
      console.log('❌ No user or error - redirecting to /login');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    console.log('✅ Access granted to /admin');
  }

  return supabaseResponse;
}
