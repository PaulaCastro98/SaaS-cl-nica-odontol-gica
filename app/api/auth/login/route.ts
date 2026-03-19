// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless'; // Para buscar o usuário
import { verifyPassword, createSession } from '@/lib/auth'; // Importa as funções do seu auth.ts
import { setSessionCookie } from '@/lib/auth-session'; // Importa a função para definir o cookie

const sql = neon(process.env.DATABASE_URL!); // Instância do neon para consultas diretas

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Buscar o usuário pelo e-mail usando neon
    const userResult = await sql`
      SELECT id, password_hash, clinic_id, name, is_admin FROM users WHERE email = ${email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // 2. Verificar a senha usando a função do seu lib/auth.ts
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    // 3. Criar uma sessão no banco de dados usando a função do seu lib/auth.ts
    const sessionId = await createSession(user.id, user.clinic_id);

    // 4. Definir o cookie de sessão usando a função do seu lib/auth-session.ts
    // Nota: setSessionCookie usa `cookies()` do Next.js, que opera em Server Components/Route Handlers.
    // A função `setSessionCookie` já manipula o `NextResponse.cookies.set` internamente.
    // No entanto, como estamos em um Route Handler, podemos definir o cookie diretamente na resposta.
    // A função `setSessionCookie` do `lib/auth-session.ts` é mais adequada para Server Actions ou Server Components.
    // Para Route Handlers, é mais direto manipular a resposta.

    const response = NextResponse.json(
      {
        message: 'Login bem-sucedido!',
        user: {
          id: user.id,
          name: user.name,
          email: email,
          clinic_id: user.clinic_id,
          is_admin: user.is_admin,
        },
      },
      { status: 200 }
    );

    // Definir o cookie diretamente na resposta do Route Handler
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao fazer login.' },
      { status: 500 }
    );
  }
}