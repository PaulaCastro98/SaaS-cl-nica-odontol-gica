import { neon } from '@neondatabase/serverless'
import { Card } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth-session'

const sql = neon(process.env.DATABASE_URL!)

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Não autenticado</div>
  }

  // Fetch dashboard stats
  const patientsResult = await sql`
    SELECT COUNT(*) as count FROM patients WHERE clinic_id = ${user.clinic_id}
  `

  const appointmentsResult = await sql`
    SELECT COUNT(*) as count FROM appointments 
    WHERE clinic_id = ${user.clinic_id} AND appointment_date >= CURRENT_DATE
  `

  const servicesResult = await sql`
    SELECT COUNT(*) as count FROM services WHERE clinic_id = ${user.clinic_id}
  `

  const salesResult = await sql`
    SELECT COALESCE(SUM(amount), 0) as total FROM sales 
    WHERE clinic_id = ${user.clinic_id} AND sale_date = CURRENT_DATE
  `

  const patients = patientsResult[0]?.count || 0
  const appointments = appointmentsResult[0]?.count || 0
  const services = servicesResult[0]?.count || 0
  const todaySales = salesResult[0]?.total || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo ao DentOS</h1>
        <p className="text-muted-foreground">Gerencie sua clínica de forma eficiente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pacientes</p>
              <p className="text-3xl font-bold text-foreground">{patients}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Consultas Hoje</p>
              <p className="text-3xl font-bold text-foreground">{appointments}</p>
            </div>
            <span className="text-4xl">📅</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Serviços</p>
              <p className="text-3xl font-bold text-foreground">{services}</p>
            </div>
            <span className="text-4xl">🦷</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vendas Hoje</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {Number(todaySales).toFixed(2)}
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Próximas Atividades</h2>
          <div className="text-muted-foreground text-sm">
            <p>Nenhuma atividade agendada no momento</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Resumo Rápido</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clínica:</span>
              <span className="text-foreground font-medium">{user.clinic_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground font-medium">{user.email}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
