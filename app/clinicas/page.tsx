import { neon } from '@neondatabase/serverless'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const sql = neon(process.env.DATABASE_URL!)

async function getClinics() {
  const clinics = await sql`
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.address,
      COUNT(DISTINCT s.id) as service_count,
      COUNT(DISTINCT p.id) as patient_count
    FROM clinics c
    LEFT JOIN services s ON c.id = s.clinic_id
    LEFT JOIN patients p ON c.id = p.clinic_id
    GROUP BY c.id, c.name, c.phone, c.address
    ORDER BY c.created_at DESC
    LIMIT 12
  `
  return clinics
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default async function ClinicasPage() {
  const clinics = await getClinics()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">DentOS</h1>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Plataforma de Gestão para Clínicas Odontológicas
          </p>
          <div className="flex gap-4">
            <Link href="/signup">
              <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Começar Agora
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Clínicas */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-4 text-center">Clínicas Parceiras</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Conheça as clínicas que utilizam a plataforma DentOS para oferecer o melhor serviço.
        </p>

        {clinics.length === 0 ? (
          <Card className="p-12 text-center bg-secondary border-border">
            <p className="text-muted-foreground mb-4">Nenhuma clínica cadastrada ainda.</p>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Seja a Primeira
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => {
              const slug = slugify(clinic.name)
              return (
                <Link key={clinic.id} href={`/clinica/${slug}`}>
                  <Card className="h-full p-6 bg-card border-border hover:shadow-lg hover:border-primary transition cursor-pointer">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{clinic.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{clinic.address}</p>
                    </div>

                    <div className="flex gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Serviços</p>
                        <p className="font-semibold text-foreground">{clinic.service_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pacientes</p>
                        <p className="font-semibold text-foreground">{clinic.patient_count}</p>
                      </div>
                    </div>

                    <p className="text-sm text-primary hover:underline">
                      Conhecer Clínica →
                    </p>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-card border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Por Que Usar DentOS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📅</span>
              <h3 className="font-bold text-foreground mb-2">Agenda Inteligente</h3>
              <p className="text-muted-foreground">Gerencie suas consultas de forma simples e eficiente.</p>
            </div>
            <div className="text-center">
              <span className="text-4xl mb-4 block">👥</span>
              <h3 className="font-bold text-foreground mb-2">Gestão de Pacientes</h3>
              <p className="text-muted-foreground">Tenha todos os dados dos seus pacientes organizados.</p>
            </div>
            <div className="text-center">
              <span className="text-4xl mb-4 block">💰</span>
              <h3 className="font-bold text-foreground mb-2">Controle Financeiro</h3>
              <p className="text-muted-foreground">Acompanhe suas receitas e gere relatórios mensais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Transformar sua Clínica?</h2>
          <p className="mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Junte-se a outras clínicas odontológicas que já utilizam DentOS para melhorar sua gestão.
          </p>
          <Link href="/signup">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Criar Conta Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 DentOS. Todos os direitos reservados.</p>
          <p className="mt-2">Plataforma de Gestão para Clínicas Odontológicas</p>
        </div>
      </footer>
    </main>
  )
}
