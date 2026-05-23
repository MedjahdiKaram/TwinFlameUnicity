import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Admin paths
const ADMIN_PATHS = ['/admin']
// Auth-protected paths (user must be logged in)
const PROTECTED_PATHS = ['/profile', '/profil', '/الملف-الشخصي']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix for path checking
  const pathWithoutLocale = pathname.replace(/^\/(fr|ar)/, '') || '/'

  // Check if it's an admin or protected route
  const isAdminRoute = ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p))
  const isProtectedRoute = PROTECTED_PATHS.some((p) =>
    pathWithoutLocale.startsWith(p)
  )

  if (isAdminRoute || isProtectedRoute) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Determine locale from pathname
      const locale = pathname.startsWith('/ar') ? 'ar' : 'fr'
      const loginPath = locale === 'ar' ? '/ar/تسجيل-دخول' : '/fr/connexion'
      const url = request.nextUrl.clone()
      url.pathname = loginPath
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (isAdminRoute) {
      // Check admin role via profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
        const locale = pathname.startsWith('/ar') ? 'ar' : 'fr'
        const homePath = `/${locale}`
        const url = request.nextUrl.clone()
        url.pathname = homePath
        return NextResponse.redirect(url)
      }
    }

    // Run i18n middleware on the modified response
    const intlResponse = intlMiddleware(request)
    // Carry over any auth cookies
    response.cookies.getAll().forEach(({ name, value }) => {
      intlResponse?.cookies.set(name, value)
    })
    return intlResponse ?? response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
