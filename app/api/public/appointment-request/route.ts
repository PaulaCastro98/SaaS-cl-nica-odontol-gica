import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { clinic_id, name, phone, service_id, message } = await request.json()

    if (!clinic_id || !name || !phone) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: clinic_id, name, phone' },
        { status: 400 }
      )
    }

    // Verificar se a clinica existe
    const clinicResult = await sql`
      SELECT id, name, whatsapp, phone FROM clinics WHERE id = ${clinic_id}
    `

    if (clinicResult.length === 0) {
      return NextResponse.json(
        { error: 'Clinica nao encontrada' },
        { status: 404 }
      )
    }

    // Inserir solicitacao de agendamento
    const result = await sql`
      INSERT INTO appointment_requests 
        (clinic_id, name, phone, service_id, message, status, created_at)
      VALUES 
        (${clinic_id}, ${name}, ${phone}, ${service_id || null}, ${message || null}, 'pending', now())
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result[0].id,
      message: 'Solicitacao de agendamento enviada com sucesso',
    })
  } catch (error) {
    console.error('Error creating appointment request:', error)
    return NextResponse.json(
      { error: 'Erro ao criar solicitacao de agendamento' },
      { status: 500 }
    )
  }
}

// GET para listar solicitacoes de uma clinica (para o painel admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinic_id = searchParams.get('clinic_id')

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id obrigatorio' },
        { status: 400 }
      )
    }

    const requests = await sql`
      SELECT 
        ar.id, ar.name, ar.phone, ar.message, ar.status, ar.created_at,
        s.name as service_name
      FROM appointment_requests ar
      LEFT JOIN services s ON ar.service_id = s.id
      WHERE ar.clinic_id = ${clinic_id}
      ORDER BY ar.created_at DESC
    `

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching appointment requests:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar solicitacoes' },
      { status: 500 }
    )
  }
}
