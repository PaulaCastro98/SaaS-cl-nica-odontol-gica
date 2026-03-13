import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.pathname.split('/').pop()
    const body = await request.json()

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (body.status) {
      updates.push(`status = $${updates.length + 1}`)
      values.push(body.status)
    }

    if (body.whatsapp_sent !== undefined) {
      updates.push(`whatsapp_sent = $${updates.length + 1}`)
      values.push(body.whatsapp_sent)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    updates.push(`updated_at = now()`)

    const query = `
      UPDATE appointment_requests 
      SET ${updates.join(', ')}
      WHERE id = $${updates.length + 1} AND clinic_id = $${updates.length + 2}
    `

    await sql(query, [...values, id, user.clinic_id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating appointment request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
