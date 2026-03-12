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

    const patients = await sql`
      SELECT id, name, email, phone, date_of_birth, created_at
      FROM patients
      WHERE clinic_id = ${user.clinic_id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(patients, { status: 200 })
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter pacientes' },
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

    const { name, email, phone, date_of_birth } = await request.json()

    const result = await sql`
      INSERT INTO patients (clinic_id, name, email, phone, date_of_birth, created_at)
      VALUES (${user.clinic_id}, ${name}, ${email}, ${phone}, ${date_of_birth}, now())
      RETURNING id, name, email, phone, date_of_birth
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    )
  }
}
