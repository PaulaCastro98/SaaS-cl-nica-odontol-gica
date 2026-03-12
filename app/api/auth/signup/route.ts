import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, createSession } from '@/lib/auth'
import { setSessionCookie } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if clinic with this email already exists
    const existingClinic = await sql`
      SELECT id FROM clinics WHERE email = ${email}
    `

    if (existingClinic.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate a slug from email
    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

    // Create clinic and admin user in transaction
    const clinicResult = await sql`
      INSERT INTO clinics (name, slug, email, created_at, updated_at)
      VALUES (${email}, ${slug}, ${email}, now(), now())
      RETURNING id
    `

    const clinicId = clinicResult[0].id

    const userResult = await sql`
      INSERT INTO users (email, name, password_hash, clinic_id, role, created_at)
      VALUES (${email}, ${email}, ${hashedPassword}, ${clinicId}, 'admin', now())
      RETURNING id
    `

    const userId = userResult[0].id

    // Create session
    const sessionId = await createSession(userId, clinicId)

    // Set cookie and redirect
    const response = NextResponse.json(
      { success: true, clinicId, userId },
      { status: 201 }
    )

    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
