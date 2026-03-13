import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('[v0] Executando migracao: appointment_requests...');
    
    // Criar tabela de solicitacoes de agendamento
    await sql`
      CREATE TABLE IF NOT EXISTS appointment_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        service_id UUID REFERENCES services(id) ON DELETE SET NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('[v0] Tabela appointment_requests criada!');
    
    // Criar indice para busca por clinica
    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointment_requests_clinic ON appointment_requests(clinic_id)
    `;
    
    // Criar indice para busca por status
    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status)
    `;
    
    console.log('[v0] Indices criados!');
    console.log('[v0] Migracao concluida com sucesso!');
    
  } catch (error) {
    console.error('[v0] Erro na migracao:', error.message);
    process.exit(1);
  }
}

runMigration();
