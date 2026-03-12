import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas
  const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/signup']
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar sessão para rotas protegidas
  const sessionId = request.cookies.get('sessionId')?.value
  
  if (!sessionId && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|public).*)'],
}
