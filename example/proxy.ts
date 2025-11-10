import { NextRequest, NextResponse } from 'next/server'
import { readMaintenanceConfig, isMaintenanceActive } from 'nextjs-maintenance-mode/config'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip maintenance check for:
  // - Maintenance page itself
  // - API routes
  // - Static files and Next.js internals
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Read maintenance configuration
  const config = readMaintenanceConfig('public/maintenance.json', { silent: true })

  // Check if maintenance is active
  if (isMaintenanceActive(config)) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

// Optional: Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
