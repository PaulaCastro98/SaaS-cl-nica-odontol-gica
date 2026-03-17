import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function checkUser() {
  try {
    console.log('[v0] Checking user seu@email.com...')
    
    const result = await sql`
      SELECT id, name, email, password_hash, clinic_id FROM users WHERE email = 'seu@email.com'
    `
    
    if (result.length === 0) {
      console.log('[v0] User not found!')
    } else {
      console.log('[v0] User found:')
      console.log('[v0]   ID:', result[0].id)
      console.log('[v0]   Name:', result[0].name)
      console.log('[v0]   Email:', result[0].email)
      console.log('[v0]   Password hash exists:', !!result[0].password_hash)
      console.log('[v0]   Clinic ID:', result[0].clinic_id)
      
      // Check clinic
      const clinic = await sql`SELECT id, name, slug FROM clinics WHERE id = ${result[0].clinic_id}`
      if (clinic.length > 0) {
        console.log('[v0] Clinic found:')
        console.log('[v0]   Name:', clinic[0].name)
        console.log('[v0]   Slug:', clinic[0].slug)
      }
    }
  } catch (error) {
    console.error('[v0] Error:', error.message)
  }
}

checkUser()
