import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { session, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center">
          <Logo className="h-8 sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#recursos" className="transition-smooth hover:text-foreground">
            Recursos
          </a>
          <a href="#modelos" className="transition-smooth hover:text-foreground">
            Modelos
          </a>
          <a href="#precos" className="transition-smooth hover:text-foreground">
            Preços
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {loading ? null : session ? (
            <Button asChild size="sm">
              <Link to="/painel">Painel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ modo: "entrar" }}>Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ modo: "registo" }}>
                  Criar currículo
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
