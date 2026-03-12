import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    )
  }
}
