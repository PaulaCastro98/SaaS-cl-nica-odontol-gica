// middleware.ts (na raiz da pasta 'app' ou na raiz do projeto, dependendo da sua estrutura)
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, clearSessionCookie } from '@/lib/auth-session'; // Importa as funções do seu auth-session.ts

// Estende o tipo NextRequest para incluir as propriedades do usuário
// Isso é uma declaração de tipo global para TypeScript
declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      clinic_id: string;
      clinic_name: string;
    };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que NÃO precisam de autenticação
  const publicPaths = [
    '/login',
    '/signup',
    '/api/auth/login',
    '/api/auth/register', // Se você tiver uma rota de registro
    '/api/clinics/slug', // Rota pública para buscar clínica por slug
  ];

  // Verifica se a rota atual é uma rota pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Se for uma rota pública, permite que a requisição continue sem autenticação
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Para rotas protegidas, tenta obter o usuário da sessão
  try {
    const user = await getCurrentUser(); // Usa a função do seu lib/auth-session.ts para validar a sessão

    if (!user) {
      // Se não houver usuário na sessão (sessão inválida ou expirada)
      // E a rota não for uma API (para APIs, retornamos 401, para páginas, redirecionamos)
      if (!pathname.startsWith('/api')) {
        // Redireciona para a página de login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname); // Opcional: para redirecionar de volta após o login
        const response = NextResponse.redirect(loginUrl);
        await clearSessionCookie(); // Limpa o cookie para garantir
        return response;
      } else {
        // Para rotas de API, retorna um erro 401 (Não Autorizado)
        const response = NextResponse.json({ message: 'Não autorizado: Sessão inválida ou expirada.' }, { status: 401 });
        await clearSessionCookie(); // Limpa o cookie para garantir
        return response;
      }
    }

    // Se o usuário estiver autenticado, anexa as informações do usuário aos headers da requisição
    // Isso permite que as rotas de API acessem esses dados facilmente
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-name', user.name);
    requestHeaders.set('x-clinic-id', user.clinic_id);
    requestHeaders.set('x-clinic-name', user.clinic_name); // Se clinic_name estiver disponível em user

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Erro de autenticação no middleware:', error);
    // Em caso de erro inesperado, limpa o cookie e retorna um erro
    const response = NextResponse.json({ message: 'Erro interno do servidor ao autenticar.' }, { status: 500 });
    await clearSessionCookie();
    return response;
  }
}

export const config = {
  // O matcher que você já tinha é bom, ele exclui arquivos estáticos e internos do Next.js
  matcher: ['/((?!_next|.*\\..*|public).*)'],
};

