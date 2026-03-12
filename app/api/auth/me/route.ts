import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-session'
// Force cache invalidation

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
