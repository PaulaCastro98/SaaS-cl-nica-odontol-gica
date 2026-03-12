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

    // Get all sales
    const sales = await sql`
      SELECT 
        s.id, 
        p.name as patient_name,
        s.description,
        s.total_amount,
        s.created_at as sale_date
      FROM sales s
      JOIN patients p ON s.patient_id = p.id
      WHERE s.clinic_id = ${user.clinic_id}
      ORDER BY s.created_at DESC
    `

    // Get monthly summary
    const monthly = await sql`
      SELECT 
        TO_CHAR(s.created_at, 'YYYY-MM') as month,
        SUM(s.total_amount) as total
      FROM sales s
      WHERE s.clinic_id = ${user.clinic_id}
      GROUP BY TO_CHAR(s.created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `

    return NextResponse.json(
      { sales, monthly },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get sales error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter vendas' },
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

    const { patient_id, description, total_amount } = await request.json()

    const result = await sql`
      INSERT INTO sales 
        (clinic_id, patient_id, description, total_amount, created_at)
      VALUES 
        (${user.clinic_id}, ${patient_id}, ${description}, ${total_amount}, now())
      RETURNING id
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 }
    )
  }
}
