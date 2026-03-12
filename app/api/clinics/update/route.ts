import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { name, phone, address } = await request.json()

    await sql`
      UPDATE clinics
      SET name = ${name}, phone = ${phone}, address = ${address}, updated_at = now()
      WHERE id = ${user.clinic_id}
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Update clinic error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar clínica' },
      { status: 500 }
    )
  }
}
