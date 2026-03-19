import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const requests = await sql`
      SELECT 
        ar.id,
        ar.clinic_id,
        ar.name as patient_name,
        ar.phone as patient_phone,
        ar.service_id,
        s.name as service_name,
        ar.message,
        ar.status,
        ar.created_at
      FROM appointment_requests ar
      LEFT JOIN services s ON ar.service_id = s.id
      WHERE ar.clinic_id = ${user.clinic_id} AND ar.status = ${status}
      ORDER BY ar.created_at DESC
    `

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[v0] Error fetching appointment requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 })
    }

    await sql`
      UPDATE appointment_requests 
      SET status = ${status}, updated_at = now()
      WHERE id = ${id} AND clinic_id = ${user.clinic_id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating appointment request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
