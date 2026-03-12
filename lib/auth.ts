import { hash, compare } from 'bcryptjs'
import { neon } from '@neondatabase/serverless'
import { users, clinics, sessions } from '@/lib/db/schema'

const sql = neon(process.env.DATABASE_URL!)

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

export async function createSession(userId: string, clinicId: string): Promise<string> {
  const sessionId = crypto.randomUUID()
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await sql`
    INSERT INTO sessions (id, user_id, clinic_id, token, expires_at, created_at)
    VALUES (${sessionId}, ${userId}, ${clinicId}, ${token}, ${expiresAt}, now())
  `

  return sessionId
}

export async function getSessionUser(sessionId: string) {
  const result = await sql`
    SELECT u.id, u.email, u.name, u.clinic_id, c.name as clinic_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN clinics c ON u.clinic_id = c.id
    WHERE s.id = ${sessionId} AND s.expires_at > now()
  `

  return result[0] || null
}

export async function deleteSession(sessionId: string) {
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`
}
