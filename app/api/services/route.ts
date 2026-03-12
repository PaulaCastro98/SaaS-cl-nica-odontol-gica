import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const services = await sql`
      SELECT id, name, description, price, duration_minutes, created_at
      FROM services
      WHERE clinic_id = ${user.clinic_id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter serviços' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { name, description, price, duration_minutes } = await request.json()

    const result = await sql`
      INSERT INTO services (clinic_id, name, description, price, duration_minutes, created_at)
      VALUES (${user.clinic_id}, ${name}, ${description}, ${price}, ${duration_minutes}, now())
      RETURNING id, name, description, price, duration_minutes
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    )
  }
}
