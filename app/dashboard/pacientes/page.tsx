// app/dashboard/pacientes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      const data = await response.json()

      // --- ALTERAÇÃO 1: Adiciona console.log para depuração ---
      console.log('Frontend recebeu dados da API de pacientes:', data);

      // --- ALTERAÇÃO 2: Garante que 'data' é um array antes de setar ---
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        // Se a API retornar um objeto de erro ou algo inesperado,
        // logue um aviso e defina patients como um array vazio para evitar o erro .map
        console.warn('API de pacientes retornou dados não-array ou erro:', data);
        setPatients([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes (rede/parsing):', error);
      setPatients([]); // Garante que patients seja um array vazio em caso de erro de rede/parsing
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', date_of_birth: '' })
        setShowForm(false)
        fetchPatients()
      }
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie todos os pacientes da clínica</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Cancelar' : '+ Novo Paciente'}
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
                  placeholder="Nome do paciente"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data de Nascimento</label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Adicionar Paciente</Button>
          </form>
        </Card>
      )}

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando pacientes...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum paciente cadastrado. Comece adicionando um novo!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Telefone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* --- ALTERAÇÃO 3: Garante que patients é um array antes de mapear --- */}
                {patients && Array.isArray(patients) && patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{patient.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/dashboard/pacientes/${patient.id}`} className="text-primary hover:underline">
                        Ver Detalhes
                      </Link>
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