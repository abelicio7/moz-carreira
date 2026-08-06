import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { MODELOS } from "@/lib/cv/modelos";
import { DADOS_EXEMPLO } from "@/lib/cv/dados";
import { ORDEM_PADRAO, normalizarVisiveis } from "@/lib/cv/personalizacao";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/modelos")({
  head: () => ({
    meta: [
      { title: "Modelos de currículo — Moz Carreira" },
      {
        name: "description",
        content:
          "Escolha entre 12 modelos profissionais de currículo, do minimalista ao criativo, todos personalizáveis.",
      },
      { property: "og:title", content: "12 modelos profissionais — Moz Carreira" },
      { property: "og:description", content: "Modelos clássicos, modernos, criativos e optimizados para ATS." },
    ],
  }),
  component: Modelos,
});

const CATEGORIAS = ["Todos", "Clássico", "Moderno", "Criativo", "Executivo", "ATS"] as const;

function Modelos() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<(typeof CATEGORIAS)[number]>("Todos");

  const lista = MODELOS.filter((m) => filtro === "Todos" || m.categoria === filtro);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel">
              <ArrowLeft className="h-4 w-4" />
              Painel
            </Link>
          </Button>
          <Badge variant="secondary">12 modelos</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-rise">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Modelos profissionais</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Escolha um ponto de partida. Depois pode alterar cores, tipografia, espaçamento e a ordem
            das secções.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={filtro === c ? "default" : "outline"}
              onClick={() => setFiltro(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((m) => (
            <Card key={m.id} className="gap-0 overflow-hidden border-border/70 p-0 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-lift">
              <div className="relative h-[300px] overflow-hidden bg-muted">
                <div
                  className="absolute left-0 top-0 origin-top-left"
                  style={{ width: 794, height: 1000, transform: "scale(0.42)" }}
                >
                  <CVPreview
                    modelo={m}
                    dados={DADOS_EXEMPLO}
                    opcoes={{
                      cor: m.corPadrao,
                      tipografia: m.tipografiaPadrao,
                      espacamento: "normal",
                      tamanhoFonte: 11,
                      ordem: ORDEM_PADRAO,
                      visiveis: normalizarVisiveis({ referencias: false, projetos: false }),
                    }}
                  />
                </div>
                {m.premium && (
                  <Badge className="absolute right-3 top-3 gap-1">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">{m.nome}</h2>
                  <Badge variant="secondary">{m.categoria}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{m.descricao}</p>
                <Button
                  className="mt-2 w-full"
                  onClick={() => navigate({ to: "/personalizar", search: { modelo: m.id } })}
                >
                  <Sparkles className="h-4 w-4" />
                  Personalizar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-accent" />
          Todos os modelos são compatíveis com exportação A4.
        </p>
      </main>
    </div>
  );
}
