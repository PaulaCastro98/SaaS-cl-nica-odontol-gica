import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function testAuth() {
  try {
    console.log('[v0] Testing authentication flow...');
    
    // Get the user
    const userResult = await sql`
      SELECT id, email, password_hash, clinic_id FROM users WHERE email = 'seu@email.com'
    `;
    
    if (userResult.length === 0) {
      console.log('[v0] User not found');
      return;
    }
    
    const user = userResult[0];
    console.log('[v0] User found:', user.email);
    console.log('[v0] Password hash:', user.password_hash.substring(0, 20) + '...');
    
    // Test password verification
    const testPassword = 'senha123';
    console.log('[v0] Testing password:', testPassword);
    
    const isValid = await bcryptjs.compare(testPassword, user.password_hash);
    console.log('[v0] Password is valid:', isValid);
    
    if (isValid) {
      console.log('[v0] ✅ Authentication would succeed!');
    } else {
      console.log('[v0] ❌ Password verification failed!');
      console.log('[v0] This might mean the password was changed or stored incorrectly');
    }
    
  } catch (error) {
    console.error('[v0] Test error:', error.message);
  }
}

testAuth();
