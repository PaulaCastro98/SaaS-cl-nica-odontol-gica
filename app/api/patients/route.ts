// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.warn('API GET /api/patients: Tentativa de acesso não autenticado.')
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
    // Este console.log é para depuração no terminal do servidor
    console.log('API GET /api/patients retornou:', patients);

    // O driver Neon já retorna um array de objetos para SELECT.
    return NextResponse.json(patients, { status: 200 })
  } catch (error) {
    console.error('API GET /api/patients error:', error) // Log mais específico
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
      console.warn('API POST /api/patients: Tentativa de criação não autenticada.')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { name, email, phone, date_of_birth } = await request.json()

    // Validação básica para garantir que os dados não são vazios
    if (!name || !email || !phone || !date_of_birth) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO patients (clinic_id, name, email, phone, date_of_birth, created_at)
      VALUES (${user.clinic_id}, ${name}, ${email}, ${phone}, ${date_of_birth}, now())
      RETURNING id, name, email, phone, date_of_birth
    `
    // Este console.log é para depuração no terminal do servidor
    console.log('API POST /api/patients criou:', result[0]);

    // O driver Neon retorna um array de objetos para RETURNING. result[0] é o objeto do paciente recém-criado.
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('API POST /api/patients error:', error) // Log mais específico
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    )
  }
}