import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/onboarding',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/public',
  '/clinica',
  '/clinicas',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isPublic) {
    return NextResponse.next()
  }

  const sessionId = request.cookies.get('sessionId')?.value

  if (!sessionId) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
