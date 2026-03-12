import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { clearSessionCookie } from '@/lib/auth-session'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value

    if (sessionId) {
      await deleteSession(sessionId)
    }

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    response.cookies.delete('sessionId')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}
