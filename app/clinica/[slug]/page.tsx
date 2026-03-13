'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Phone, MapPin, Clock, Star, CheckCircle, MessageCircle, Calendar, Shield, Users, Sparkles, Mail } from 'lucide-react'

interface Clinic {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
}

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
}

export default function ClinicLandingPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service_id: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/public/clinic/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setClinic(data.clinic)
          setServices(data.services)
        }
      } catch (error) {
        console.error('Error fetching clinic:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinic) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/public/appointment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinic.id,
          ...formData,
        }),
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', phone: '', service_id: '', message: '' })
      }
    } catch (error) {
      console.error('Error submitting:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const openWhatsApp = () => {
    if (!clinic?.whatsapp && !clinic?.phone) return
    const phone = (clinic.whatsapp || clinic.phone || '').replace(/\D/g, '')
    const message = encodeURIComponent(`Ola! Gostaria de agendar uma consulta na ${clinic.name}.`)
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">Clinica nao encontrada</h1>
        <Link href="/clinicas">
          <Button>Ver todas as clinicas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">{clinic.name}</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#servicos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Servicos</a>
              <a href="#sobre" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
              <a href="#contato" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contato</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button onClick={openWhatsApp} className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Link href="/login">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                Clinica avaliada com 5 estrelas
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Seu sorriso merece o{' '}
                <span className="text-primary">melhor cuidado</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {clinic.description || 'Oferecemos tratamentos odontologicos de alta qualidade com profissionais experientes e tecnologia de ponta. Agende sua consulta e transforme seu sorriso.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 text-base" onClick={() => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Calendar className="w-5 h-5" />
                  Agendar Consulta
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base" onClick={openWhatsApp}>
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Atendimento humanizado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Tecnologia moderna</span>
                </div>
              </div>
            </div>
            <div className="relative" id="agendamento">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <Card className="relative overflow-hidden border-0 shadow-2xl">
                <CardHeader className="bg-primary text-primary-foreground p-6">
                  <CardTitle className="text-2xl">Agende sua consulta</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Preencha o formulario e entraremos em contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {submitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Solicitacao enviada!</h3>
                      <p className="text-muted-foreground">Entraremos em contato em breve para confirmar seu agendamento.</p>
                      <Button variant="outline" onClick={() => setSubmitted(false)}>Fazer outro agendamento</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Seu nome</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Digite seu nome completo"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Servico de interesse</label>
                        <select
                          value={formData.service_id}
                          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground"
                          required
                        >
                          <option value="">Selecione um servico</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name} - R$ {Number(service.price).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Mensagem (opcional)</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Alguma informacao adicional?"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground min-h-[80px] resize-none"
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Solicitar Agendamento'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Pacientes atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{services.length}+</div>
              <div className="text-sm text-muted-foreground mt-1">Tipos de servicos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground mt-1">Anos de experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">5.0</div>
              <div className="text-sm text-muted-foreground mt-1">Avaliacao media</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Nossos Servicos
            </h2>
            <p className="text-lg text-muted-foreground">
              Oferecemos uma variedade de tratamentos para cuidar do seu sorriso
            </p>
          </div>
          
          {services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">R$ {Number(service.price).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.duration_minutes} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum servico cadastrado ainda.
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="sobre" className="bg-muted/30 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Por que nos escolher?
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprometidos com a excelencia no cuidado da sua saude bucal
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Seguranca e Higiene</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seguimos rigorosos protocolos de biosseguranca para garantir sua saude e tranquilidade.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Equipe Especializada</h3>
              <p className="text-muted-foreground leading-relaxed">
                Profissionais qualificados e em constante atualizacao para oferecer o melhor tratamento.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tecnologia Avancada</h3>
              <p className="text-muted-foreground leading-relaxed">
                Equipamentos modernos para diagnosticos precisos e tratamentos mais eficientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Entre em contato
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Estamos aqui para responder suas duvidas e agendar sua consulta. 
                Entre em contato pelo meio que preferir.
              </p>
              <div className="space-y-6">
                {clinic.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Endereco</h4>
                      <p className="text-muted-foreground">
                        {clinic.address}
                        {clinic.city && `, ${clinic.city}`}
                        {clinic.state && ` - ${clinic.state}`}
                        {clinic.zip_code && ` | CEP: ${clinic.zip_code}`}
                      </p>
                    </div>
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Telefone</h4>
                      <p className="text-muted-foreground">{clinic.phone}</p>
                    </div>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Email</h4>
                      <p className="text-muted-foreground">{clinic.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">WhatsApp</h4>
                    <p className="text-muted-foreground">{clinic.whatsapp || clinic.phone || 'Nao informado'}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={openWhatsApp}>
                      Clique para conversar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Horario de Atendimento</h3>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Segunda a Sexta</span>
                  <span className="font-medium text-foreground">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sabado</span>
                  <span className="font-medium text-foreground">08:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="font-medium text-foreground">Fechado</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                <Button size="lg" className="w-full gap-2" onClick={() => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Calendar className="w-5 h-5" />
                  Agendar minha consulta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
            Pronto para transformar seu sorriso?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Agende sua avaliacao gratuita e descubra como podemos ajudar voce a conquistar o sorriso dos seus sonhos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="gap-2 text-base" onClick={() => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })}>
              <Calendar className="w-5 h-5" />
              Agendar Avaliacao Gratuita
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={openWhatsApp}>
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xl font-bold">{clinic.name}</span>
            </div>
            <p className="text-background/60 text-sm">
              {new Date().getFullYear()} {clinic.name}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-background/60">
              <span>Desenvolvido com</span>
              <Link href="/clinicas" className="text-background hover:underline">DentOS</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
