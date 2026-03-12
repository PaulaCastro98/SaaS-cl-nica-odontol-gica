'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Sale {
  id: string
  patient_name: string
  description: string | null
  amount: number
  payment_method: string | null
  status: string
  sale_date: string
}

interface MonthlySummary {
  month: string
  total: number
}

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    notes: '',
    amount: '',
    payment_method: 'cash',
  })
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    fetchSales()
    fetchPatients()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      const data = await response.json()
      setSales(data.sales || [])
      setMonthlySummary(data.monthly || [])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        setFormData({ patient_id: '', notes: '', amount: '', payment_method: 'cash' })
        setShowForm(false)
        fetchSales()
      }
    } catch (error) {
      console.error('Erro ao criar venda:', error)
    }
  }

  const totalThisMonth = monthlySummary.length > 0 ? monthlySummary[monthlySummary.length - 1].total : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground">Gerencie as receitas da clínica</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          {showForm ? 'Cancelar' : '+ Nova Venda'}
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
                <label className="block text-sm font-medium text-foreground mb-2">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Forma de Pagamento</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre a venda"
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Registrar Venda</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Este Mês</p>
          <p className="text-3xl font-bold text-primary">
            R$ {Number(totalThisMonth).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-2">Total de Vendas</p>
          <p className="text-3xl font-bold text-foreground">
            {sales.length}
          </p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground mb-2">Ticket Médio</p>
          <p className="text-3xl font-bold text-foreground">
            R$ {sales.length > 0 ? (sales.reduce((sum, s) => sum + Number(s.amount || 0), 0) / sales.length).toFixed(2) : '0.00'}
          </p>
        </Card>
      </div>

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando vendas...
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma venda registrada. Comece registrando uma!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Paciente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descrição</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">{sale.patient_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{sale.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">
                      R$ {Number(sale.amount || 0).toFixed(2)}
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
