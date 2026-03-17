import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, createSession } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('[v0] Login attempt:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Find user by email
    const userResult = await sql`
      SELECT id, password_hash, clinic_id FROM users WHERE email = ${email}
    `

    console.log('[v0] User found:', userResult.length > 0)

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    const user = userResult[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    console.log('[v0] Password valid:', isValid)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Create session
    console.log('[v0] Creating session...')
    const sessionId = await createSession(user.id, user.clinic_id)
    console.log('[v0] Session created:', sessionId)

    // Set cookie
    const response = NextResponse.json(
      { success: true, userId: user.id, clinicId: user.clinic_id },
      { status: 200 }
    )

    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    console.log('[v0] Login successful')
    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login: ' + (error instanceof Error ? error.message : 'Desconhecido') },
      { status: 500 }
    )
  }
}
