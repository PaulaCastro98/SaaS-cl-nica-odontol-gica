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

    const clinic = await sql`
      SELECT id, name, email, phone, address
      FROM clinics
      WHERE id = ${user.clinic_id}
    `

    return NextResponse.json(clinic[0], { status: 200 })
  } catch (error) {
    console.error('Get clinic error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter informações da clínica' },
      { status: 500 }
    )
  }
}
