import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowDown, ArrowUp, Eye, EyeOff, Save, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { MODELOS, getModelo } from "@/lib/cv/modelos";
import { DADOS_EXEMPLO } from "@/lib/cv/dados";
import {
  CORES,
  ESPACAMENTOS,
  SECCOES,
  TIPOGRAFIAS,
  ORDEM_PADRAO,
  normalizarOrdem,
  normalizarVisiveis,
  type SeccaoId,
} from "@/lib/cv/personalizacao";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  modelo: z.string().optional(),
  cv: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/personalizar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Personalizar currículo — Moz Carreira" },
      {
        name: "description",
        content:
          "Altere cores, tipografia, espaçamento e a ordem das secções do seu currículo com pré-visualização em tempo real.",
      },
      { property: "og:title", content: "Personalizar currículo — Moz Carreira" },
      { property: "og:description", content: "Cores, tipografia, espaçamento e ordem das secções." },
    ],
  }),
  component: Personalizar,
});

function Personalizar() {
  const navigate = useNavigate();
  const { modelo: modeloUrl, cv } = Route.useSearch();

  const { data: curriculo, isLoading } = useQuery({
    queryKey: ["curriculo-personalizar", cv ?? "recente"],
    queryFn: async () => {
      const q = supabase
        .from("curriculos")
        .select("id, titulo, modelo, cor_principal, tipografia, espacamento, tamanho_fonte, ordem_seccoes, seccoes_visiveis")
        .order("updated_at", { ascending: false })
        .limit(1);
      const { data } = cv ? await q.eq("id", cv) : await q;
      return data?.[0] ?? null;
    },
  });

  const [modeloId, setModeloId] = useState(modeloUrl ?? "minimalista");
  const [cor, setCor] = useState(getModelo(modeloUrl ?? "minimalista").corPadrao);
  const [tipografia, setTipografia] = useState(getModelo(modeloUrl ?? "minimalista").tipografiaPadrao);
  const [espacamento, setEspacamento] = useState("normal");
  const [tamanhoFonte, setTamanhoFonte] = useState(11);
  const [ordem, setOrdem] = useState<SeccaoId[]>(ORDEM_PADRAO);
  const [visiveis, setVisiveis] = useState(normalizarVisiveis({}));
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    if (!curriculo) return;
    if (!modeloUrl) {
      setModeloId(curriculo.modelo);
      setCor(curriculo.cor_principal);
      setTipografia(curriculo.tipografia);
    }
    setEspacamento(curriculo.espacamento);
    setTamanhoFonte(curriculo.tamanho_fonte);
    setOrdem(normalizarOrdem(curriculo.ordem_seccoes));
    setVisiveis(normalizarVisiveis(curriculo.seccoes_visiveis));
  }, [curriculo, modeloUrl]);

  const modelo = useMemo(() => getModelo(modeloId), [modeloId]);

  const aplicarModelo = (id: string) => {
    const m = getModelo(id);
    setModeloId(id);
    setCor(m.corPadrao);
    setTipografia(m.tipografiaPadrao);
  };

  const mover = (index: number, delta: number) => {
    setOrdem((atual) => {
      const nova = [...atual];
      const alvo = index + delta;
      if (alvo < 0 || alvo >= nova.length) return atual;
      [nova[index], nova[alvo]] = [nova[alvo]!, nova[index]!];
      return nova;
    });
  };

  const reiniciar = () => {
    aplicarModelo(modeloId);
    setEspacamento("normal");
    setTamanhoFonte(11);
    setOrdem(ORDEM_PADRAO);
    setVisiveis(normalizarVisiveis({}));
    toast.info("Personalização reposta.");
  };

  const guardar = async () => {
    setAGuardar(true);
    const valores = {
      modelo: modeloId,
      cor_principal: cor,
      tipografia,
      espacamento,
      tamanho_fonte: tamanhoFonte,
      ordem_seccoes: ordem,
      seccoes_visiveis: visiveis,
    };
    try {
      if (curriculo) {
        const { error } = await supabase.from("curriculos").update(valores).eq("id", curriculo.id);
        if (error) throw error;
      } else {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Sessão expirada");
        const { data, error } = await supabase
          .from("curriculos")
          .insert({ ...valores, user_id: auth.user.id, titulo: "Novo currículo" })
          .select("id")
          .single();
        if (error) throw error;
        navigate({ to: "/personalizar", search: { cv: data.id }, replace: true });
      }
      toast.success("Personalização guardada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/modelos">
              <ArrowLeft className="h-4 w-4" />
              Modelos
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reiniciar}>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Repor</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descarregar PDF</span>
            </Button>
            <Button size="sm" onClick={guardar} disabled={aGuardar || isLoading}>
              <Save className="h-4 w-4" />
              {aGuardar ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-extrabold">Personalizar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              As alterações aparecem em tempo real na pré-visualização.
            </p>
          </div>

          <Card className="gap-4 border-border/70 p-5 shadow-soft">
            <Label>Modelo</Label>
            <Select value={modeloId} onValueChange={aplicarModelo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELOS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome} · {m.categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="gap-4 border-border/70 p-5 shadow-soft">
            <Label>Cor principal</Label>
            <div className="flex flex-wrap gap-2">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Cor ${c}`}
                  onClick={() => setCor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-smooth ${
                    cor.toLowerCase() === c.toLowerCase()
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ background: c }}
                />
              ))}
              <label className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-border px-3 text-xs">
                Outra
                <input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
            </div>
          </Card>

          <Card className="gap-4 border-border/70 p-5 shadow-soft">
            <div className="grid gap-2">
              <Label>Tipografia</Label>
              <Select value={tipografia} onValueChange={setTipografia}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOGRAFIAS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span style={{ fontFamily: t.familia }}>{t.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Espaçamento</Label>
              <div className="grid grid-cols-3 gap-2">
                {ESPACAMENTOS.map((e) => (
                  <Button
                    key={e.id}
                    type="button"
                    size="sm"
                    variant={espacamento === e.id ? "default" : "outline"}
                    onClick={() => setEspacamento(e.id)}
                  >
                    {e.nome}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tamanho do texto: {tamanhoFonte}pt</Label>
              <Slider
                min={9}
                max={14}
                step={1}
                value={[tamanhoFonte]}
                onValueChange={([v]) => setTamanhoFonte(v ?? 11)}
              />
            </div>
          </Card>

          <Card className="gap-3 border-border/70 p-5 shadow-soft">
            <Label>Ordem e visibilidade das secções</Label>
            <div className="grid gap-2">
              {ordem.map((id, i) => {
                const nome = SECCOES.find((s) => s.id === id)?.nome ?? id;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2"
                  >
                    <span className="flex-1 truncate text-sm">{nome}</span>
                    <button
                      type="button"
                      aria-label={`Mostrar ou esconder ${nome}`}
                      onClick={() => setVisiveis((v) => ({ ...v, [id]: !v[id] }))}
                      className="text-muted-foreground transition-smooth hover:text-foreground"
                    >
                      {visiveis[id] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label={`Subir ${nome}`}
                      disabled={i === 0}
                      onClick={() => mover(i, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label={`Descer ${nome}`}
                      disabled={i === ordem.length - 1}
                      onClick={() => mover(i, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Nos modelos com coluna lateral, competências, idiomas e certificados aparecem na barra.
            </p>
          </Card>

          <Card className="flex-row items-center gap-3 border-border/70 p-4 shadow-soft">
            <Switch id="exemplo" checked disabled />
            <Label htmlFor="exemplo" className="text-sm text-muted-foreground">
              Pré-visualização com dados de exemplo
            </Label>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted p-4 shadow-lift">
            <div className="mx-auto w-full max-w-[794px] overflow-hidden rounded-lg bg-white shadow-soft">
              <div style={{ aspectRatio: "210 / 297" }} className="overflow-hidden">
                <CVPreview
                  modelo={modelo}
                  dados={DADOS_EXEMPLO}
                  opcoes={{ cor, tipografia, espacamento, tamanhoFonte, ordem, visiveis }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
