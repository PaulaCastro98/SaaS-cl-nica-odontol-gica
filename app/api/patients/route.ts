// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getCurrentUser } from '@/lib/auth-session';

// Inicializa a conexão com o banco de dados Neon
const sql = neon(process.env.DATABASE_URL!);

/**
 * Manipula requisições GET para buscar pacientes.
 * Retorna uma lista de pacientes associados à clínica do usuário autenticado.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Verifica se o usuário está autenticado
    if (!user) {
      console.warn('API GET /api/patients: Tentativa de acesso não autenticado.');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca pacientes no banco de dados, usando 'birthdate'
    const patients = await sql`
      SELECT id, name, email, phone, birthdate, created_at
      FROM patients
      WHERE clinic_id = ${user.clinic_id}
      ORDER BY created_at DESC
    `;

    // Log para depuração no terminal do servidor
    console.log('API GET /api/patients retornou:', patients);

    // Retorna a lista de pacientes como JSON
    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    // Loga o erro e retorna uma resposta de erro 500
    console.error('API GET /api/patients error:', error);
    return NextResponse.json(
      { error: 'Erro ao obter pacientes' },
      { status: 500 }
    );
  }
}

/**
 * Manipula requisições POST para criar um novo paciente.
 * Cria um novo paciente associado à clínica do usuário autenticado.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Verifica se o usuário está autenticado
    if (!user) {
      console.warn('API POST /api/patients: Tentativa de criação não autenticada.');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Desestrutura os dados do corpo da requisição, esperando 'birthdate'
    const { name, email, phone, birthdate } = await request.json();

    // Validação básica para garantir que os dados obrigatórios não são vazios
    if (!name || !email || !phone || !birthdate) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    // Insere o novo paciente no banco de dados, usando 'birthdate'
    const result = await sql`
      INSERT INTO patients (clinic_id, name, email, phone, birthdate, created_at)
      VALUES (${user.clinic_id}, ${name}, ${email}, ${phone}, ${birthdate}, now())
      RETURNING id, name, email, phone, birthdate, created_at
    `;

    // Log para depuração no terminal do servidor
    console.log('API POST /api/patients criou:', result[0]);

    // Retorna o paciente recém-criado como JSON
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    // Loga o erro e retorna uma resposta de erro 500
    console.error('API POST /api/patients error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    );
  }
}