import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[AUTH CALLBACK] Error exchanging code:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }

      // Determine redirect based on the type of auth action
      if (type === 'recovery') {
        // Password reset flow - redirect to reset password page
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
      }

      if (type === 'signup' || type === 'email') {
        // Email confirmation - redirect to verify-email success page
        return NextResponse.redirect(new URL('/verify-email', requestUrl.origin));
      }

      // Default redirect
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (err) {
      console.error('[AUTH CALLBACK] Unexpected error:', err);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
