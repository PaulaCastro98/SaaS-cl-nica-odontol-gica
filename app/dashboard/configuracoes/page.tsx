'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Clinic {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchClinic()
  }, [])

  const fetchClinic = async () => {
    try {
      const response = await fetch('/api/clinics/current')
      const data = await response.json()
      setClinic(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
      })
    } catch (error) {
      console.error('Erro ao carregar dados da clínica:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/clinics/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Configurações salvas com sucesso!')
        fetchClinic()
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        Carregando configurações...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as informações da sua clínica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Clínica */}
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Informações da Clínica</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da clínica"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, cidade..."
                disabled={saving}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">Informações Gerais</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Email:</p>
                <p className="text-foreground font-medium">{clinic?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID da Clínica:</p>
                <p className="text-foreground font-mono text-xs break-all">{clinic?.id}</p>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  )
}
