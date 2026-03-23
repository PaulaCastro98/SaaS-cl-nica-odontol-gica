// app/api/public/clinic/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } } // CORREÇÃO AQUI: params NÃO é uma Promise
) {
  try {
    const { slug } = params // CORREÇÃO AQUI: Não precisa de 'await'

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
      console.warn(`API GET /api/public/clinic/${slug}: Clínica não encontrada.`)
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
    console.log(`API GET /api/public/clinic/${slug}: Dados da clínica e serviços retornados.`)
    return NextResponse.json({
      clinic,
      services,
    })
  } catch (error: any) { // Adicionado ': any' para melhor depuração e acesso a 'error.message'
    console.error(`Error fetching clinic by slug (${params.slug}):`, error.message || error)
    return NextResponse.json(
      { error: 'Erro ao buscar clinica', details: error.message || 'Erro desconhecido' },
      { status: 500 }
    )
  }
}