// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless'; // Para buscar o usuário
import { verifyPassword, createSession } from '@/lib/auth'; // Importa as funções do seu auth.ts
import { setSessionCookie } from '@/lib/auth-session'; // Importa a função para definir o cookie

const sql = neon(process.env.DATABASE_URL!); // Instância do neon para consultas diretas

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('[v0] Login attempt:', email)

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

    console.log('[v0] User found:', userResult.length > 0)

    if (userResult.length === 0) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    console.log('[v0] Password valid:', isValid)
    
    if (!isValid) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    // Create session
    console.log('[v0] Creating session...')
    const sessionId = await createSession(user.id, user.clinic_id)
    console.log('[v0] Session created:', sessionId)

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

    console.log('[v0] Login successful')
    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login: ' + (error instanceof Error ? error.message : 'Desconhecido') },
      { status: 500 }
    );
  }
}