import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Download,
  Languages,
  ShieldCheck,
  Palette,
  Check,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moz Carreira — Crie o seu currículo profissional em minutos" },
      {
        name: "description",
        content:
          "A maior plataforma moçambicana de criação de currículos. Modelos profissionais, edição em tempo real e inteligência artificial para se destacar em qualquer vaga.",
      },
      { property: "og:title", content: "Moz Carreira — Currículos profissionais em minutos" },
      {
        property: "og:description",
        content:
          "Modelos profissionais, pré-visualização em tempo real e IA para melhorar o seu currículo. O seu caminho. O seu futuro. O seu sucesso.",
      },
    ],
  }),
  component: LandingPage,
});

const recursos = [
  {
    icon: Sparkles,
    titulo: "Escrita com IA",
    texto: "Melhore o resumo, as descrições das experiências e adapte o currículo a cada vaga.",
  },
  {
    icon: Palette,
    titulo: "Modelos personalizáveis",
    texto: "Cores, tipografia, espaçamento e ordem das secções — tudo ao seu gosto.",
  },
  {
    icon: FileText,
    titulo: "Pré-visualização em tempo real",
    texto: "Veja o currículo a ganhar forma enquanto escreve, sem recarregar nada.",
  },
  {
    icon: Download,
    titulo: "Exportação em PDF",
    texto: "Descarregue ou imprima com qualidade profissional, pronto a enviar.",
  },
  {
    icon: Languages,
    titulo: "Português e Inglês",
    texto: "Traduza o currículo com um clique e concorra a vagas internacionais.",
  },
  {
    icon: ShieldCheck,
    titulo: "Os seus dados protegidos",
    texto: "Cada conta acede apenas aos seus próprios documentos. Sempre.",
  },
];

const modelos = [
  "Minimalista",
  "Executivo",
  "Moderno",
  "Criativo",
  "Elegante",
  "Tecnologia",
  "Clássico",
  "Estudante",
  "Primeiro Emprego",
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-soft">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">
                <Zap className="h-3.5 w-3.5" />
                Feito para o mercado moçambicano
              </span>
              <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
                O currículo que abre <span className="text-gradient-brand">as portas certas</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Crie, personalize e exporte currículos profissionais em minutos. Com modelos
                elegantes e inteligência artificial a escrever consigo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/auth" search={{ modo: "registo" }}>
                    Criar o meu currículo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#modelos">Ver modelos</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Grátis para começar · Sem cartão de crédito
              </p>
            </div>

            <div className="animate-rise [animation-delay:120ms]">
              <CvMockup />
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section id="recursos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Tudo o que precisa para se destacar</h2>
            <p className="mt-3 text-muted-foreground">
              Uma plataforma completa, pensada para candidaturas em Moçambique e no estrangeiro.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => (
              <Card
                key={r.titulo}
                className="group gap-3 border-border/70 p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{r.titulo}</h3>
                <p className="text-sm text-muted-foreground">{r.texto}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* MODELOS */}
        <section id="modelos" className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Modelos profissionais</h2>
              <p className="mt-3 text-muted-foreground">
                Do primeiro emprego ao cargo executivo — escolha o estilo e personalize tudo.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modelos.map((m, i) => (
                <Card
                  key={m}
                  className="overflow-hidden border-border/70 p-0 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="aspect-[3/4] w-full bg-card p-5">
                    <TemplateSkeleton accent={i % 3} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <span className="text-sm font-semibold">{m}</span>
                    <span className="text-xs text-muted-foreground">
                      {i < 2 ? "Grátis" : "Premium"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PREÇOS */}
        <section id="precos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Planos simples</h2>
            <p className="mt-3 text-muted-foreground">
              Comece grátis. Faça a atualização quando precisar de mais.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="border-border/70 p-8 shadow-soft">
              <h3 className="text-xl font-semibold">Gratuito</h3>
              <p className="mt-1 text-sm text-muted-foreground">Para a primeira candidatura</p>
              <p className="mt-6 text-4xl font-extrabold">0 MT</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["1 currículo", "2 modelos", "Exportação em PDF", "Recursos básicos"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-8 w-full">
                <Link to="/auth" search={{ modo: "registo" }}>
                  Começar grátis
                </Link>
              </Button>
            </Card>

            <Card className="relative overflow-hidden border-primary/30 bg-gradient-soft p-8 shadow-lift">
              <span className="absolute top-6 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                Mais popular
              </span>
              <h3 className="text-xl font-semibold">Premium</h3>
              <p className="mt-1 text-sm text-muted-foreground">Para quem quer o lugar</p>
              <p className="mt-6 text-4xl font-extrabold">
                499 MT<span className="text-base font-medium text-muted-foreground">/mês</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Currículos ilimitados",
                  "Todos os modelos",
                  "Assistente de IA",
                  "Cartas de apresentação e motivação",
                  "Tradução do currículo",
                  "Personalização completa",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <Link to="/auth" search={{ modo: "registo" }}>
                  Experimentar Premium
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pagamentos por M-Pesa e e-Mola em breve
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-gradient-brand">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              A sua próxima oportunidade começa aqui
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Junte-se aos moçambicanos que já constroem carreiras com a Moz Carreira.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/auth" search={{ modo: "registo" }}>
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CvMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -top-6 -right-4 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-lift sm:block">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Resumo melhorado com IA
        </p>
      </div>
      <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-lift">
        <div className="bg-gradient-brand px-6 py-6">
          <p className="font-display text-lg font-bold text-primary-foreground">Ana Macuácua</p>
          <p className="text-xs text-primary-foreground/80">Gestora de Projectos · Maputo</p>
        </div>
        <div className="space-y-5 p-6">
          <MockSection titulo="Resumo profissional" linhas={[100, 92, 70]} />
          <MockSection titulo="Experiência" linhas={[85, 96, 60, 88]} />
          <MockSection titulo="Formação" linhas={[78, 55]} />
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Competências
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Gestão", "Excel", "Inglês", "Liderança"].map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-medium text-primary"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MockSection({ titulo, linhas }: { titulo: string; linhas: number[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {titulo}
      </p>
      <div className="mt-2 space-y-1.5">
        {linhas.map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function TemplateSkeleton({ accent }: { accent: number }) {
  const barra = accent === 0 ? "bg-primary" : accent === 1 ? "bg-accent" : "bg-primary/60";
  return (
    <div className="flex h-full flex-col gap-3">
      <div className={`h-2.5 w-1/2 rounded-full ${barra}`} />
      <div className="h-1.5 w-1/3 rounded-full bg-muted" />
      <div className="mt-2 space-y-1.5">
        {[95, 88, 72, 90, 64].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className={`mt-3 h-1.5 w-1/4 rounded-full ${barra}`} />
      <div className="space-y-1.5">
        {[80, 92, 58].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
