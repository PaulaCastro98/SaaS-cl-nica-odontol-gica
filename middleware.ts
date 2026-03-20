import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/api/auth/login', 
    '/api/auth/signup', 
    '/api/public', 
    '/clinica', 
    '/clinicas',
    '/onboarding'
  ]
  
  // Verifica se a rota atual é pública
  const isPublicPath = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Verificar sessão para rotas protegidas
  const sessionId = request.cookies.get('sessionId')?.value
  
  if (!sessionId && !pathname.startsWith('/api')) {
    // Redireciona para login se não tem sessão
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!sessionId && pathname.startsWith('/api')) {
    // Retorna 401 para APIs sem sessão
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|public).*)'],
}
