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
        s.notes as description,
        s.amount,
        s.payment_method,
        s.status,
        s.sale_date,
        s.created_at
      FROM sales s
      LEFT JOIN patients p ON s.patient_id = p.id
      WHERE s.clinic_id = ${user.clinic_id}
      ORDER BY s.sale_date DESC, s.created_at DESC
    `

    // Get monthly summary
    const monthly = await sql`
      SELECT 
        TO_CHAR(s.sale_date, 'YYYY-MM') as month,
        SUM(s.amount) as total
      FROM sales s
      WHERE s.clinic_id = ${user.clinic_id}
      GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM')
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

    const { patient_id, notes, amount, payment_method } = await request.json()

    const result = await sql`
      INSERT INTO sales 
        (clinic_id, patient_id, notes, amount, payment_method, status, sale_date, created_at)
      VALUES 
        (${user.clinic_id}, ${patient_id}, ${notes || null}, ${amount}, ${payment_method || 'cash'}, 'completed', CURRENT_DATE, now())
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
