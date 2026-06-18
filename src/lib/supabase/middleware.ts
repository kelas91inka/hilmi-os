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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Enforce Single Owner Whitelist
  const ownerEmail = process.env.OWNER_EMAIL;

  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal');
  const isLoginRoute = request.nextUrl.pathname.startsWith('/login');

  if (user) {
    // If the logged-in user is not the owner, sign them out and redirect to login
    if (ownerEmail && user.email !== ownerEmail) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    // If user is the owner and on login page, redirect to portal
    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url));
    }
  } else {
    // If there's no user and they are trying to access the portal, redirect to login
    if (isPortalRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse;
}
