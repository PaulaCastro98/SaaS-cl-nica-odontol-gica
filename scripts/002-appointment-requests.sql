-- Criar tabela de solicitacoes de agendamento (leads da landing page)
CREATE TABLE IF NOT EXISTS appointment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar indice para busca por clinica
CREATE INDEX IF NOT EXISTS idx_appointment_requests_clinic ON appointment_requests(clinic_id);

-- Criar indice para busca por status
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);
