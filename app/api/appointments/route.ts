import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

/**
 * Manipula requisições GET para obter a lista de agendamentos.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.warn('API GET /api/appointments: Tentativa de acesso não autenticado.')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    console.log('API GET /api/appointments: Buscando agendamentos para clinic_id:', user.clinic_id)
    const appointments = await sql`
      SELECT
        a.id,
        p.name AS patient_name,
        s.name AS service_name,
        -- Garante que appointment_date e start_time sejam strings formatadas
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
        TO_CHAR(a.start_time, 'HH24:MI:SS') AS start_time,
        a.duration_minutes,
        a.status,
        a.notes,
        a.created_at
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.clinic_id = ${user.clinic_id}
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `
    console.log('API GET /api/appointments: Resultado da query SQL:', appointments)
    return NextResponse.json(appointments, { status: 200 })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ error: 'Erro ao obter agendamentos' }, { status: 500 })
  }
}

/**
 * Manipula requisições POST para criar um novo agendamento.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    console.log('API POST /api/appointments: Usuário autenticado:', user ? user.id : 'NÃO AUTENTICADO')

    if (!user) {
      console.warn('API POST /api/appointments: Tentativa de criação não autenticada.')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { patient_id, service_id, appointment_date, duration_minutes, notes } = await request.json()
    console.log('API POST /api/appointments: Dados recebidos:', { patient_id, service_id, appointment_date, duration_minutes, notes })

    if (!patient_id || !service_id || !appointment_date || !duration_minutes) {
      console.warn('API POST /api/appointments: Dados obrigatórios ausentes.', { patient_id, service_id, appointment_date, duration_minutes })
      return NextResponse.json(
        { error: 'Paciente, serviço, data/hora e duração são obrigatórios.' },
        { status: 400 }
      )
    }

    const dateTime = new Date(appointment_date);
    // Verifica se a data é válida antes de tentar formatar
    if (isNaN(dateTime.getTime())) {
      console.warn('API POST /api/appointments: appointment_date inválido recebido:', appointment_date);
      return NextResponse.json(
        { error: 'Formato de data/hora inválido.' },
        { status: 400 }
      );
    }

    const formattedDate = dateTime.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    // Garante que a hora seja formatada com segundos, mesmo que o input não os tenha
    const formattedTime = dateTime.toTimeString().split(' ')[0].substring(0, 8); // 'HH:MM:SS'

    const result = await sql`
      INSERT INTO appointments
        (clinic_id, patient_id, service_id, appointment_date, start_time, duration_minutes, status, notes, created_at)
      VALUES
        (${user.clinic_id}, ${patient_id}, ${service_id}, ${formattedDate}, ${formattedTime}, ${duration_minutes}, 'agendado', ${notes || null}, now())
      RETURNING
        id,
        patient_id,
        service_id,
        TO_CHAR(appointment_date, 'YYYY-MM-DD') AS appointment_date,
        TO_CHAR(start_time, 'HH24:MI:SS') AS start_time,
        duration_minutes,
        status,
        notes,
        created_at
    `

    console.log('API POST /api/appointments: Agendamento criado:', result[0])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}