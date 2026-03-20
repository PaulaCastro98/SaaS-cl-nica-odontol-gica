// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getCurrentUser } from '@/lib/auth-session';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Manipula requisições GET para buscar serviços.
 * Retorna uma lista de serviços associados à clínica do usuário autenticado.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log('API GET /api/services: Usuário autenticado:', user ? user.id : 'NÃO AUTENTICADO');
if (!user) {
  console.warn('API GET /api/services: Tentativa de acesso não autenticado.');
  return NextResponse.json(
    { error: 'Não autenticado' },
    { status: 401 }
  );
}

console.log('API GET /api/services: Buscando serviços para clinic_id:', user.clinic_id);
const services = await sql`
  SELECT id, name, description, base_price, duration_minutes, created_at, is_active
  FROM services
  WHERE clinic_id = ${user.clinic_id}
  ORDER BY created_at DESC
`; // &lt;-- AQUI! Certifique-se de que não há nenhum '{' ou caractere extra antes deste backtick.
console.log('API GET /api/services: Resultado da query SQL:', services);

return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Erro ao obter serviços' },
      { status: 500 }
    );
  }
}

/**
 * Manipula requisições POST para criar um novo serviço.
 * Cria um novo serviço associado à clínica do usuário autenticado.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log('API POST /api/services: Usuário autenticado:', user ? user.id : 'NÃO AUTENTICADO');
if (!user) {
  console.warn('API POST /api/services: Tentativa de criação não autenticada.');
  return NextResponse.json(
    { error: 'Não autenticado' },
    { status: 401 }
  );
}

// Desestrutura os dados do corpo da requisição, esperando 'base_price'
const { name, description, base_price, duration_minutes } = await request.json();
console.log('API POST /api/services: Dados recebidos:', { name, description, base_price, duration_minutes });

// Validação básica para garantir que os dados obrigatórios não são vazios
if (!name || !base_price || !duration_minutes) {
  return NextResponse.json(
    { error: 'Nome, preço e duração são obrigatórios.' },
    { status: 400 }
  );
}

const result = await sql`
  INSERT INTO services (clinic_id, name, description, base_price, duration_minutes, created_at)
  VALUES (${user.clinic_id}, ${name}, ${description}, ${base_price}, ${duration_minutes}, now())
  RETURNING id, name, description, base_price, duration_minutes, created_at, is_active
`;
console.log('API POST /api/services: Serviço criado:', result[0]);

return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    );
  }
}