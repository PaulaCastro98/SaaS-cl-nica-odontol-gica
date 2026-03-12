'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Appointment {
  id: string
  patient_name: string
  service_name: string
  appointment_date: string
  duration_minutes: number
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
    appointment_date: '',
    duration_minutes: '30',
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
      setAppointments(data)
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patient_id: formData.patient_id,
          service_id: formData.service_id,
        }),
      })

      if (response.ok) {
        setFormData({ patient_id: '', service_id: '', appointment_date: '', duration_minutes: '30', notes: '' })
        setShowForm(false)
        fetchAppointments()
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Paciente</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Serviço</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data e Horário</label>
                <Input
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duração (min)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="30"
                  required
                />
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
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">{apt.patient_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{apt.service_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{new Date(apt.appointment_date).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{apt.duration_minutes} min</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
                        {apt.status}
                      </span>
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
