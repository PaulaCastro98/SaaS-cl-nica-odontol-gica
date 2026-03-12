import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function seedTestData() {
  try {
    console.log('[v0] Conectando ao banco de dados...');
    
    // Criar uma clínica de teste
    const clinicResult = await sql`
      INSERT INTO clinics (name, slug, email, phone, address, city, state, zipcode, bio)
      VALUES ('Clínica Teste', 'clinica-teste', 'clinica@teste.com', '1133334444', 'Rua Teste 123', 'São Paulo', 'SP', '01234-567', 'Clínica de testes')
      ON CONFLICT (slug) DO UPDATE SET name = 'Clínica Teste'
      RETURNING id
    `;
    
    const clinicId = clinicResult[0].id;
    console.log('[v0] Clínica criada/atualizada:', clinicId);
    
    // Hash da senha
    const hashedPassword = await bcryptjs.hash('senha123', 10);
    
    // Criar usuário de teste
    const userResult = await sql`
      INSERT INTO users (clinic_id, email, password, name, role, created_at)
      VALUES (${clinicId}, 'seu@email.com', ${hashedPassword}, 'Usuário Teste', 'admin', NOW())
      ON CONFLICT (email) DO UPDATE SET password = ${hashedPassword}
      RETURNING id, email
    `;
    
    const user = userResult[0];
    console.log('[v0] Usuário criado/atualizado:', user.email);
    console.log('[v0] Credenciais de teste:');
    console.log('[v0]   Email:', user.email);
    console.log('[v0]   Senha: senha123');
    console.log('[v0] Dados de teste inseridos com sucesso!');
    
  } catch (error) {
    console.error('[v0] Erro ao inserir dados de teste:', error.message);
    process.exit(1);
  }
}

seedTestData();
