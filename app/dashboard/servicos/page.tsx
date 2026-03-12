'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes),
        }),
      })

      if (response.ok) {
        setFormData({ name: '', description: '', price: '', duration_minutes: '' })
        setShowForm(false)
        fetchServices()
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerencie todos os serviços oferecidos</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Cancelar' : '+ Novo Serviço'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 bg-card border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Limpeza"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duração (minutos)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do serviço"
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Adicionar Serviço</Button>
          </form>
        </Card>
      )}

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando serviços...
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum serviço cadastrado. Comece adicionando um novo!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {services.map((service) => (
              <Card key={service.id} className="p-4 bg-secondary border-border">
                <h3 className="font-semibold text-foreground mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Duração</p>
                    <p className="font-medium text-foreground">{service.duration_minutes} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-medium text-primary">R$ {service.price.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
