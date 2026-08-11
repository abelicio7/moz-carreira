import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Mail,
  Copy,
  Printer,
  Save,
  Loader2,
  Check,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gerarCartaFn } from "@/server/functions/carta";
import { exportarElementoParaPDF } from "@/lib/cv/export";

const searchSchema = z.object({
  tipo: z.enum(["apresentacao", "motivacao"]).catch("apresentacao"),
});

export const Route = createFileRoute("/_authenticated/gerar-carta")({
  validateSearch: searchSchema,
  head: (ctx) => {
    const tipo = ctx.search.tipo;
    const nomeCarta = tipo === "apresentacao" ? "Carta de Apresentação" : "Carta de Motivação";
    return {
      meta: [
        { title: `Gerar ${nomeCarta} — Moz Carreira` },
        {
          name: "description",
          content: "Use inteligência artificial para redigir a sua carta profissional personalizada.",
        },
      ],
    };
  },
  component: GerarCarta,
});

function GerarCarta() {
  const { tipo } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCv, setSelectedCv] = useState<string>("");
  const [empresa, setEmpresa] = useState("");
  const [vaga, setVaga] = useState("");
  const [descricao, setDescricao] = useState("");

  const [gerando, setGerando] = useState(false);
  const [cartaGerada, setCartaGerada] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Queries
  const { data: curriculos = [], isLoading: isLoadingCvs } = useQuery({
    queryKey: ["curriculos-gerar-carta"],
    queryFn: async () => {
      const { data } = await supabase
        .from("curriculos")
        .select("id, titulo, updated_at")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  // Set default selected curriculum
  useEffect(() => {
    if (curriculos.length > 0 && !selectedCv) {
      setSelectedCv(curriculos[0].id);
    }
  }, [curriculos, selectedCv]);

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCv) {
      toast.error("Por favor, selecione um currículo base.");
      return;
    }
    if (!vaga) {
      toast.error("Por favor, indique a vaga que deseja concorrer.");
      return;
    }
    if (!descricao) {
      toast.error("Por favor, preencha a descrição da vaga.");
      return;
    }

    setGerando(true);
    setCartaGerada("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const res = await gerarCartaFn({
        data: {
          curriculoId: selectedCv,
          tipo,
          tituloVaga: vaga,
          empresa: empresa || "Empresa Recrutadora",
          descricaoVaga: descricao,
          authToken: token,
        },
      });

      setCartaGerada(res.texto);
      toast.success("Carta gerada com sucesso pela IA!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido ao gerar a carta.");
    } finally {
      setGerando(false);
    }
  };

  const handleSalvar = async () => {
    if (!cartaGerada) return;
    setSalvando(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        throw new Error("Sessão não encontrada.");
      }

      const tituloCarta = `Carta de ${tipo === "apresentacao" ? "Apresentação" : "Motivação"} - ${vaga} (${empresa || "Empresa"})`;

      const { error } = await supabase.from("cartas").insert({
        user_id: auth.user.id,
        curriculo_id: selectedCv || null,
        tipo: tipo,
        titulo: tituloCarta,
        conteudo: cartaGerada,
        idioma: "pt-MZ",
      });

      if (error) throw error;
      toast.success("Carta guardada no histórico com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível guardar a carta.");
    } finally {
      setSalvando(false);
    }
  };

  const handleCopiar = () => {
    if (!cartaGerada) return;
    navigator.clipboard.writeText(cartaGerada);
    setCopiado(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiado(false), 2000);
  };

  const nomeTipo = tipo === "apresentacao" ? "Apresentação" : "Motivação";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl no-print">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Painel
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold hidden md:block">
              Gerador de Carta de {nomeTipo}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {cartaGerada && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportarElementoParaPDF("carta-preview-sheet", `carta_${tipo === "apresentacao" ? "apresentacao" : "motivacao"}_${vaga.toLowerCase().replace(/\s+/g, "_")}`)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descarregar PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Print Only Header (Invisible on Web) */}
        <div className="hidden print:block text-center mb-8 border-b border-border/40 pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
            Carta de {nomeTipo}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Moz Carreira — Documento Gerado Profissionalmente</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.2fr)]">
          {/* Form Column */}
          <div className="flex flex-col gap-6 no-print">
            <div className="animate-rise">
              <h2 className="text-2xl font-bold tracking-tight">Gerar Carta de {nomeTipo} ✨</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Forneça os detalhes da candidatura. A nossa IA utilizará a informação do seu currículo para redigir uma carta focada e direcionada.
              </p>
            </div>

            <Card className="border-border/70 p-6 shadow-soft gap-5">
              <form onSubmit={handleGerar} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="curriculo">Currículo Base</Label>
                  {isLoadingCvs ? (
                    <div className="h-10 flex items-center justify-center border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> A carregar currículos...
                    </div>
                  ) : curriculos.length === 0 ? (
                    <div className="border border-yellow-500/30 bg-yellow-500/5 text-yellow-600 rounded-md p-3 text-xs leading-normal">
                      Não encontramos currículos no seu perfil. Por favor, <Link to="/editar-cv" className="font-semibold underline">crie um currículo</Link> antes de gerar cartas de apresentação.
                    </div>
                  ) : (
                    <Select value={selectedCv} onValueChange={setSelectedCv}>
                      <SelectTrigger id="curriculo">
                        <SelectValue placeholder="Selecione o currículo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {curriculos.map((cv) => (
                          <SelectItem key={cv.id} value={cv.id}>
                            {cv.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="empresa">Empresa / Instituição (Opcional)</Label>
                  <Input
                    id="empresa"
                    placeholder="ex: Standard Bank Moçambique"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="vaga">Título da Vaga / Objectivo</Label>
                  <Input
                    id="vaga"
                    placeholder="ex: Gestor de Projectos Júnior"
                    value={vaga}
                    onChange={(e) => setVaga(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="descricao">Descrição / Requisitos da Vaga</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Copie e cole a descrição da vaga, responsabilidades e competências necessárias aqui..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <Button type="submit" disabled={gerando || curriculos.length === 0} className="w-full mt-2">
                  {gerando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      A redigir carta com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Carta
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Letter Preview Sheet Column */}
          <div className="flex flex-col gap-4">
            {cartaGerada ? (
              <div className="animate-rise flex flex-col gap-4">
                {/* Tools Bar (Only on Web) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 no-print">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rascunho Gerado
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={handleCopiar}>
                      {copiado ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-1.5">{copiado ? "Copiado" : "Copiar"}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSalvar} disabled={salvando}>
                      {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="ml-1.5">Guardar</span>
                    </Button>
                  </div>
                </div>

                {/* Printable Letter Sheet */}
                <Card id="carta-preview-sheet" className="border border-border/70 bg-white p-8 md:p-12 shadow-lift min-h-[500px] flex flex-col text-foreground leading-relaxed text-sm select-text printable-sheet">
                  {/* Screen Editable Version */}
                  <Textarea
                    value={cartaGerada}
                    onChange={(e) => setCartaGerada(e.target.value)}
                    className="flex-1 w-full bg-transparent border-none focus-visible:ring-0 resize-none font-sans text-sm text-foreground p-0 leading-relaxed min-h-[550px] overflow-hidden focus:outline-none print:hidden"
                    style={{ border: "none", boxShadow: "none" }}
                  />
                  {/* Print Static Version */}
                  <div className="hidden print:block whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed text-left">
                    {cartaGerada}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="flex flex-1 flex-col items-center justify-center gap-4 border-dashed p-12 text-center shadow-soft min-h-[500px] no-print">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Mail className="h-6 w-6" />
                </span>
                <div className="max-w-xs">
                  <p className="font-semibold text-base">A sua carta aparecerá aqui</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-normal">
                    Preencha os dados da candidatura à esquerda para que a Inteligência Artificial formule uma redação altamente personalizada.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
