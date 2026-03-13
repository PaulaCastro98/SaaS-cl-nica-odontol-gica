'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AppointmentRequest {
  id: string
  clinic_id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  service_id: string
  service_name: string
  preferred_date: string
  message: string
  status: string
  whatsapp_sent: boolean
  created_at: string
}

export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointment-requests?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = async (request: AppointmentRequest) => {
    try {
      const message = encodeURIComponent(
        `Olá ${request.patient_name}! Recebemos sua solicitação de agendamento para ${request.service_name}. Em breve entraremos em contato para confirmar. Obrigado!`
      )
      const whatsappUrl = `https://wa.me/${request.patient_phone.replace(/\D/g, '')}?text=${message}`
      window.open(whatsappUrl, '_blank')

      // Mark as sent
      await fetch(`/api/appointment-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_sent: true }),
      })
      fetchRequests()
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointment-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchRequests()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Solicitações de Agendamento</h1>
        <p className="text-muted-foreground mt-2">Gerencie as solicitações de agendamento dos clientes</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'confirmed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
          >
            {status === 'pending' ? 'Pendentes' : status === 'confirmed' ? 'Confirmadas' : 'Canceladas'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-card rounded-lg border border-border p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                  <p className="text-foreground font-semibold">{request.patient_name}</p>
                  <p className="text-sm text-muted-foreground">{request.patient_email}</p>
                  <p className="text-sm text-muted-foreground">{request.patient_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serviço</p>
                  <p className="text-foreground font-semibold">{request.service_name}</p>
                  <p className="text-sm font-medium text-muted-foreground">Data Preferida</p>
                  <p className="text-foreground">{new Date(request.preferred_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensagem</p>
                  <p className="text-foreground text-sm">{request.message || 'Sem mensagem'}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleSendWhatsApp(request)}
                  className={request.whatsapp_sent ? 'opacity-50' : ''}
                >
                  {request.whatsapp_sent ? '✓ WhatsApp Enviado' : 'Enviar WhatsApp'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(request.id, 'confirmed')}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
