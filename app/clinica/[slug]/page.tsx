import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const sql = neon(process.env.DATABASE_URL!)

interface PageParams {
  params: Promise<{
    slug: string
  }>
}

async function getClinicBySlug(slug: string) {
  // Convertendo slug para formato de busca - assumindo que o slug é o ID ou nome normalizado
  const clinicResult = await sql`
    SELECT 
      c.id,
      c.name,
      c.email,
      c.phone,
      c.address,
      COUNT(DISTINCT s.id) as service_count
    FROM clinics c
    LEFT JOIN services s ON c.id = s.clinic_id
    WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER($1)
    GROUP BY c.id, c.name, c.email, c.phone, c.address
  `, [slug]

  return clinicResult[0] || null
}

async function getClinicServices(clinicId: string) {
  const services = await sql`
    SELECT id, name, description, price, duration_minutes
    FROM services
    WHERE clinic_id = ${clinicId}
    ORDER BY created_at ASC
  `
  return services
}

export default async function ClinicPage({ params }: PageParams) {
  const { slug } = await params
  const clinic = await getClinicBySlug(slug)

  if (!clinic) {
    notFound()
  }

  const services = await getClinicServices(clinic.id)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{clinic.name}</h1>
              <p className="text-primary-foreground/80">Clínica Odontológica</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="text-primary border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Informações de Contato */}
      <section className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                <p className="text-foreground font-medium">{clinic.address || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <a href={`tel:${clinic.phone}`} className="text-foreground font-medium hover:text-primary">
                  {clinic.phone || 'Não informado'}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${clinic.email}`} className="text-foreground font-medium hover:text-primary">
                  {clinic.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Nossos Serviços</h2>
        
        {services.length === 0 ? (
          <Card className="p-8 text-center bg-secondary border-border">
            <p className="text-muted-foreground">Nenhum serviço cadastrado no momento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="p-6 bg-card border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex-1">{service.name}</h3>
                  <span className="text-2xl">🦷</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">Duração</p>
                    <p className="font-medium text-foreground">{service.duration_minutes} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Marque sua Consulta</h2>
          <p className="mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Entre em contato conosco para agendar sua consulta. Nossa equipe está pronta para atendê-lo com excelência.
          </p>
          <a href={`tel:${clinic.phone}`}>
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Entrar em Contato
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 {clinic.name}. Todos os direitos reservados.</p>
          <p className="mt-2">Gerenciado por <span className="text-primary font-medium">DentOS</span></p>
        </div>
      </footer>
    </main>
  )
}
