import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

async function seedTestData() {
  try {
    console.log('[v0] Conectando ao banco de dados...');
    
    // Verificar se a clínica já existe
    const clinicCheck = await sql`SELECT id FROM clinics WHERE slug = 'clinica-teste'`;
    
    let clinicId;
    if (clinicCheck.length > 0) {
      clinicId = clinicCheck[0].id;
      console.log('[v0] Clínica existente encontrada:', clinicId);
    } else {
      const clinicResult = await sql`
        INSERT INTO clinics (name, slug, email, phone, address, city, state, zip_code, description, created_at, updated_at)
        VALUES (
          'Clínica de Teste',
          'clinica-teste',
          'contato@clinicateste.com',
          '(11) 98765-4321',
          'Rua Principal, 123',
          'São Paulo',
          'SP',
          '01310-100',
          'Uma clínica de teste para demonstração do sistema',
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      clinicId = clinicResult[0].id;
      console.log('[v0] Clínica criada:', clinicId);
    }
    
    // Hash da senha
    const hashedPassword = await bcryptjs.hash('senha123', 10);
    
    // Verificar se o usuário já existe
    const userCheck = await sql`SELECT id FROM users WHERE email = 'seu@email.com'`;
    
    if (userCheck.length > 0) {
      console.log('[v0] Usuário já existe!');
    } else {
      const userId = crypto.randomUUID();
      await sql`
        INSERT INTO users (id, clinic_id, name, email, password_hash, role, created_at)
        VALUES (
          ${userId},
          ${clinicId},
          'Usuário Teste',
          'seu@email.com',
          ${hashedPassword},
          'admin',
          NOW()
        )
      `;
      console.log('[v0] Usuário criado com sucesso!');
    }
    
    console.log('[v0] Credenciais de teste:');
    console.log('[v0]   Email: seu@email.com');
    console.log('[v0]   Senha: senha123');
    console.log('[v0] Dados de teste inseridos com sucesso!');
    
  } catch (error) {
    console.error('[v0] Erro ao inserir dados de teste:', error.message);
    process.exit(1);
  }
}

seedTestData();
