import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function runMigration() {
  try {
    console.log('[v0] Running migration 003...')
    
    await sql`
      ALTER TABLE appointment_requests 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `
    
    console.log('[v0] Migration 003 completed successfully!')
  } catch (error) {
    console.error('[v0] Migration error:', error)
    process.exit(1)
  }
}

runMigration()
