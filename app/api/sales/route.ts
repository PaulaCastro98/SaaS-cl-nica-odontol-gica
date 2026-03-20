import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.warn('API GET /api/sales: Tentativa de acesso não autenticado.')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    console.log('API GET /api/sales: Buscando vendas para clinic_id:', user.clinic_id)

    // Get all sales
    const sales = await sql`
      SELECT
        s.id,
        p.name as patient_name,
        d.name as dentist_name, -- Adicionado: Nome do dentista
        svc.name as service_name, -- Adicionado: Nome do serviço
        s.description, -- CORREÇÃO AQUI: Seleciona a coluna 'description' diretamente
        s.amount,
        s.payment_method,
        TO_CHAR(s.sale_date, 'YYYY-MM-DD') AS sale_date, -- Formata a data para consistência
        s.created_at
      FROM sales s
      LEFT JOIN patients p ON s.patient_id = p.id
      LEFT JOIN dentists d ON s.dentist_id = d.id -- Adicionado JOIN para dentistas
      LEFT JOIN services svc ON s.service_id = svc.id -- Adicionado JOIN para serviços
      WHERE s.clinic_id = ${user.clinic_id}
      ORDER BY s.sale_date DESC, s.created_at DESC -- Adicionado created_at para ordenação secundária
    `
    console.log('API GET /api/sales: Vendas encontradas:', sales.length)

    // Calculate monthly totals
    const monthly = await sql`
      SELECT
        TO_CHAR(sale_date, 'YYYY-MM') as month,
        SUM(amount) as total_amount
      FROM sales
      WHERE clinic_id = ${user.clinic_id}
      GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `
    console.log('API GET /api/sales: Totais mensais calculados:', monthly)

    // Calculate total sales and average ticket
    const totalSalesResult = await sql`
      SELECT
        COUNT(id) as total_count,
        SUM(amount) as total_sum
      FROM sales
      WHERE clinic_id = ${user.clinic_id}
    `
    const totalSalesCount = parseInt(totalSalesResult[0]?.total_count || '0');
    const totalSalesSum = parseFloat(totalSalesResult[0]?.total_sum || '0');
    const averageTicket = totalSalesCount > 0 ? totalSalesSum / totalSalesCount : 0;

    return NextResponse.json(
      {
        sales,
        monthly,
        totalSalesCount,
        totalSalesSum,
        averageTicket: parseFloat(averageTicket.toFixed(2)) // Formata para 2 casas decimais
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get sales error:', error.message || error) // Imprime a mensagem de erro ou o objeto completo
    return NextResponse.json(
      { error: 'Erro ao obter vendas', details: error.message || 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.warn('API POST /api/sales: Tentativa de acesso não autenticado.')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { patient_id, dentist_id, appointment_id, service_id, description, amount, payment_method } = await request.json()

    // Validação básica
    if (!patient_id || !amount || !payment_method) {
      console.warn('API POST /api/sales: Dados obrigatórios ausentes.', { patient_id, amount, payment_method });
      return NextResponse.json(
        { error: 'Paciente, valor e método de pagamento são obrigatórios.' },
        { status: 400 }
      );
    }

    // Garante que 'amount' seja um número
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.warn('API POST /api/sales: Valor de venda inválido.', { amount });
      return NextResponse.json(
        { error: 'O valor da venda deve ser um número válido.' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO sales
        (clinic_id, patient_id, dentist_id, appointment_id, service_id, description, amount, payment_method, sale_date, created_at)
      VALUES
        (${user.clinic_id},
         ${patient_id},
         ${dentist_id || null},    -- Pode ser NULL
         ${appointment_id || null}, -- Pode ser NULL
         ${service_id || null},     -- Pode ser NULL
         ${description || null},    -- Usa 'description'
         ${parsedAmount},
         ${payment_method || 'cash'},
         CURRENT_DATE,
         now())
      RETURNING id, patient_id, dentist_id, appointment_id, service_id, description, amount, payment_method, sale_date, created_at
    `

    console.log('API POST /api/sales: Venda criada:', result[0])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error('Create sale error:', error.message || error)
    return NextResponse.json(
      { error: 'Erro ao criar venda', details: error.message || 'Erro desconhecido' },
      { status: 500 }
    )
  }
}