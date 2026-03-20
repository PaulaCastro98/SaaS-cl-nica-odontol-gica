// app/dashboard/agenda/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Appointment {
  id: string
  patient_name: string
  service_name: string
  appointment_date: string // Agora é apenas a data (YYYY-MM-DD)
  start_time: string      // Nova coluna para a hora (HH:MM:SS)
  duration_minutes: number // Esta duração vem da tabela 'appointments'
  status: string
  notes: string | null
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    service_id: '',
    appointment_date: '', // Este campo agora representa a data e hora combinadas do input datetime-local
    duration_minutes: '30', // Mantido como string para o input
    notes: '',
  })
  const [patients, setPatients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchServices()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()

      console.log('API /api/appointments retornou:', data);
      if (Array.isArray(data)) {
        setAppointments(data)
      } else {
        console.error('Erro: API /api/appointments não retornou um array de agendamentos:', data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Erro ao carregar agenda (rede/parsing):', error)
      setAppointments([]);
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      console.log('API /api/patients retornou:', data);
      if (Array.isArray(data)) {
        setPatients(data)
      } else {
        console.error('Erro: API /api/patients não retornou um array de pacientes:', data);
        setPatients([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes (rede/parsing):', error)
      setPatients([]);
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      console.log('API /api/services retornou:', data);
      if (Array.isArray(data)) {
        setServices(data)
      } else {
        console.error('Erro: API /api/services não retornou um array de serviços:', data);
        setServices([]);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços (rede/parsing):', error)
      setServices([]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: formData.patient_id,
          service_id: formData.service_id,
          appointment_date: formData.appointment_date, // Enviando a data e hora combinadas para a API
          duration_minutes: parseInt(formData.duration_minutes) || 30, // Garante que seja um número válido
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        setFormData({ patient_id: '', service_id: '', appointment_date: '', duration_minutes: '30', notes: '' })
        setShowForm(false)
        fetchAppointments() // Recarrega a lista de agendamentos após adicionar um novo
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar agendamento (API):', errorData.error);
        alert(`Erro ao agendar consulta: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao criar agendamento (rede/parsing):', error)
      alert('Erro de conexão ao agendar consulta.');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie as consultas marcadas</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Cancelar' : '+ Nova Consulta'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Agendar Nova Consulta</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="patient_id" className="block text-sm font-medium text-foreground mb-2">Paciente</label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
                  required
                >
                  <option value="" disabled>Selecione um paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="service_id" className="block text-sm font-medium text-foreground mb-2">Serviço</label>
                <select
                  id="service_id"
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
                  required
                >
                  <option value="" disabled>Selecione um serviço</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="appointment_date" className="block text-sm font-medium text-foreground mb-2">Data e Horário</label>
                <Input
                  type="datetime-local"
                  id="appointment_date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-foreground mb-2">Duração (min)</label>
                <Input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground min-h-[80px]"
                  placeholder="Adicione notas sobre a consulta..."
                ></textarea>
              </div>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Agendar Consulta</Button>
          </form>
        </Card>
      )}

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando agenda...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma consulta agendada. Comece marcando uma nova!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Paciente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Serviço</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data/Hora</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Duração</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Notas</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">{apt.patient_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{apt.service_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {/* Envolve console.log em uma função de execução imediata que retorna null */}
                      {(() => {
                        console.log('Dados de data/hora para agendamento:', apt.id, 'Date:', apt.appointment_date, 'Time:', apt.start_time);
                        return null; // Retorna null para não renderizar nada no JSX
                      })()}
                      {apt.appointment_date && apt.start_time
                        ? new Date(`${apt.appointment_date}T${apt.start_time.substring(0, 8)}`).toLocaleString('pt-BR')
                        : 'Data/Hora Indisponível'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {apt.duration_minutes ? `${apt.duration_minutes} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {apt.notes || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}