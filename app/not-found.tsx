import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Desculpe, a página que você está procurando não existe ou foi removida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/clinicas">
            <Button variant="outline">
              Ver Clínicas
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
