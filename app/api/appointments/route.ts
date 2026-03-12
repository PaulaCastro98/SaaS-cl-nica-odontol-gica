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

    const appointments = await sql`
      SELECT 
        a.id, 
        p.name as patient_name,
        s.name as service_name,
        a.appointment_date,
        a.duration_minutes,
        a.status,
        a.notes,
        a.created_at
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.clinic_id = ${user.clinic_id}
      ORDER BY a.appointment_date DESC
    `

    return NextResponse.json(appointments, { status: 200 })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter agendamentos' },
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

    const { patient_id, service_id, appointment_date, duration_minutes, notes } = await request.json()

    const result = await sql`
      INSERT INTO appointments 
        (clinic_id, patient_id, service_id, appointment_date, duration_minutes, status, notes, created_at)
      VALUES 
        (${user.clinic_id}, ${patient_id}, ${service_id}, ${appointment_date}, ${duration_minutes || 30}, 'scheduled', ${notes || null}, now())
      RETURNING id
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
