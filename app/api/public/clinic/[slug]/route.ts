import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar clinica pelo slug
    const clinicResult = await sql`
      SELECT 
        id, name, slug, description, phone, whatsapp, email, 
        address, city, state, zip_code
      FROM clinics
      WHERE slug = ${slug}
      LIMIT 1
    `

    if (clinicResult.length === 0) {
      return NextResponse.json(
        { error: 'Clinica nao encontrada' },
        { status: 404 }
      )
    }

    const clinic = clinicResult[0]

    // Buscar servicos da clinica
    const services = await sql`
      SELECT id, name, description, price, duration_minutes
      FROM services
      WHERE clinic_id = ${clinic.id}
      ORDER BY name ASC
    `

    return NextResponse.json({
      clinic,
      services,
    })
  } catch (error) {
    console.error('Error fetching clinic:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clinica' },
      { status: 500 }
    )
  }
}
