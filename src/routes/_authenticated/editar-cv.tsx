import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages,
  Award,
  Link as LinkIcon,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getModelo } from "@/lib/cv/modelos";
import { normalizarOrdem, normalizarVisiveis } from "@/lib/cv/personalizacao";
import { temConteudo, type DadosCV } from "@/lib/cv/dados";

const searchSchema = z.object({
  cv: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/editar-cv")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Editar currículo — Moz Carreira" },
      {
        name: "description",
        content: "Edite as secções do seu currículo e veja as alterações em tempo real.",
      },
    ],
  }),
  component: EditarCv,
});

const PASSOS = [
  { id: 1, nome: "Dados Pessoais", icon: User },
  { id: 2, nome: "Resumo", icon: FileText },
  { id: 3, nome: "Experiência", icon: Briefcase },
  { id: 4, nome: "Formação", icon: GraduationCap },
  { id: 5, nome: "Competências", icon: Sparkles },
  { id: 6, nome: "Idiomas", icon: Languages },
  { id: 7, nome: "Certificados", icon: Award },
  { id: 8, nome: "Projectos & Referências", icon: LinkIcon },
];

function EditarCv() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cv: cvId } = Route.useSearch();

  const [activeStep, setActiveStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  // Queries
  const { data: curriculo, isLoading: isLoadingCv } = useQuery({
    queryKey: ["curriculo-editar", cvId],
    queryFn: async () => {
      const q = supabase
        .from("curriculos")
        .select("id, titulo, modelo, cor_principal, tipografia, espacamento, tamanho_fonte, ordem_seccoes, seccoes_visiveis, dados_pessoais")
        .order("updated_at", { ascending: false })
        .limit(1);
      const { data } = cvId ? await q.eq("id", cvId) : await q;
      return data?.[0] ?? null;
    },
  });

  const activeCvId = curriculo?.id;

  const { data: experiencias = [], isLoading: isLoadingExp } = useQuery({
    queryKey: ["experiencias", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("experiencias").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: formacoes = [], isLoading: isLoadingForm } = useQuery({
    queryKey: ["formacoes", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("formacoes").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: competencias = [], isLoading: isLoadingComp } = useQuery({
    queryKey: ["competencias", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("competencias").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: idiomas = [], isLoading: isLoadingIdiomas } = useQuery({
    queryKey: ["idiomas", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("idiomas").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: certificados = [], isLoading: isLoadingCert } = useQuery({
    queryKey: ["certificados", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("certificados").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: projetos = [], isLoading: isLoadingProj } = useQuery({
    queryKey: ["projetos", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("projetos").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  const { data: referencias = [], isLoading: isLoadingRef } = useQuery({
    queryKey: ["referencias", activeCvId],
    enabled: !!activeCvId,
    queryFn: async () => {
      const { data } = await supabase.from("referencias").select("*").eq("curriculo_id", activeCvId).order("ordem");
      return data ?? [];
    },
  });

  // Local state for live preview
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resumo, setResumo] = useState("");

  const [localExperiencias, setLocalExperiencias] = useState<any[]>([]);
  const [localFormacoes, setLocalFormacoes] = useState<any[]>([]);
  const [localCompetencias, setLocalCompetencias] = useState<any[]>([]);
  const [localIdiomas, setLocalIdiomas] = useState<any[]>([]);
  const [localCertificados, setLocalCertificados] = useState<any[]>([]);
  const [localProjetos, setLocalProjetos] = useState<any[]>([]);
  const [localReferencias, setLocalReferencias] = useState<any[]>([]);

  // List editing indexes
  const [editExpIdx, setEditExpIdx] = useState<number | null>(null);
  const [editFormIdx, setEditFormIdx] = useState<number | null>(null);
  const [editCompIdx, setEditCompIdx] = useState<number | null>(null);
  const [editIdiomaIdx, setEditIdiomaIdx] = useState<number | null>(null);
  const [editCertIdx, setEditCertIdx] = useState<number | null>(null);
  const [editProjIdx, setEditProjIdx] = useState<number | null>(null);
  const [editRefIdx, setEditRefIdx] = useState<number | null>(null);

  // Auto-creation of empty CV
  useEffect(() => {
    if (isLoadingCv || curriculo || isCreating) return;

    const createNewCv = async () => {
      setIsCreating(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const defaultDadosPessoais = {
        nome: auth.user.user_metadata?.nome || auth.user.user_metadata?.full_name || "",
        cargo: "",
        email: auth.user.email || "",
        telefone: auth.user.user_metadata?.telefone || "",
        local: "Moçambique",
        linkedin: "",
        resumo: "",
      };

      const { data, error } = await supabase
        .from("curriculos")
        .insert({
          user_id: auth.user.id,
          titulo: "Meu Primeiro Currículo",
          modelo: "minimalista",
          cor_principal: "#1B4079",
          tipografia: "inter",
          espacamento: "normal",
          tamanho_fonte: 11,
          ordem_seccoes: ["resumo", "experiencias", "formacoes", "competencias", "idiomas", "certificados", "projetos", "referencias"],
          seccoes_visiveis: normalizarVisiveis({}),
          dados_pessoais: defaultDadosPessoais,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Erro ao criar currículo: " + error.message);
        setIsCreating(false);
      } else {
        queryClient.invalidateQueries({ queryKey: ["curriculo-editar"] });
        navigate({ to: "/editar-cv", search: { cv: data.id }, replace: true });
      }
    };

    createNewCv();
  }, [curriculo, isLoadingCv, isCreating, navigate, queryClient]);

  // Sync DB to local state
  useEffect(() => {
    if (!curriculo) return;
    const dp = (curriculo.dados_pessoais as Record<string, string>) || {};
    setNome(dp.nome || "");
    setCargo(dp.cargo || "");
    setEmail(dp.email || "");
    setTelefone(dp.telefone || "");
    setLocal(dp.local || "");
    setLinkedin(dp.linkedin || "");
    setResumo(dp.resumo || "");
  }, [curriculo]);

  useEffect(() => {
    setLocalExperiencias(experiencias);
  }, [experiencias]);

  useEffect(() => {
    setLocalFormacoes(formacoes);
  }, [formacoes]);

  useEffect(() => {
    setLocalCompetencias(competencias);
  }, [competencias]);

  useEffect(() => {
    setLocalIdiomas(idiomas);
  }, [idiomas]);

  useEffect(() => {
    setLocalCertificados(certificados);
  }, [certificados]);

  useEffect(() => {
    setLocalProjetos(projetos);
  }, [projetos]);

  useEffect(() => {
    setLocalReferencias(referencias);
  }, [referencias]);

  const modelo = useMemo(() => getModelo(curriculo?.modelo || "minimalista"), [curriculo?.modelo]);
  const opcoes = useMemo(() => {
    return {
      cor: curriculo?.cor_principal || "#1B4079",
      tipografia: curriculo?.tipografia || "inter",
      espacamento: curriculo?.espacamento || "normal",
      tamanhoFonte: curriculo?.tamanho_fonte || 11,
      ordem: normalizarOrdem(curriculo?.ordem_seccoes),
      visiveis: normalizarVisiveis(curriculo?.seccoes_visiveis),
    };
  }, [curriculo]);

  // Construct combined preview data
  const previewDados: DadosCV = useMemo(() => {
    return {
      nome,
      cargo,
      email,
      telefone,
      local,
      linkedin,
      resumo,
      experiencias: localExperiencias.map((e) => ({
        cargo: e.cargo,
        empresa: e.empresa,
        local: e.local || undefined,
        periodo: [e.data_inicio, e.data_fim || (e.atual ? "Presente" : "")].filter(Boolean).join(" — "),
        descricao: e.descricao || undefined,
      })),
      formacoes: localFormacoes.map((f) => ({
        curso: f.curso,
        instituicao: f.instituicao,
        periodo: [f.data_inicio, f.data_fim || (f.atual ? "Presente" : "")].filter(Boolean).join(" — "),
        descricao: f.descricao || undefined,
      })),
      competencias: localCompetencias.map((c) => ({
        nome: c.nome,
        nivel: Number(c.nivel),
      })),
      idiomas: localIdiomas.map((i) => ({
        idioma: i.idioma,
        nivel: i.nivel,
      })),
      certificados: localCertificados.map((c) => ({
        nome: c.nome,
        instituicao: c.instituicao || undefined,
        data: c.data || undefined,
      })),
      projetos: localProjetos.map((p) => ({
        nome: p.nome,
        descricao: p.descricao || undefined,
        url: p.url || undefined,
      })),
      referencias: localReferencias.map((r) => ({
        nome: r.nome,
        cargo: r.cargo || undefined,
        empresa: r.empresa || undefined,
        telefone: r.telefone || undefined,
      })),
    };
  }, [nome, cargo, email, telefone, local, linkedin, resumo, localExperiencias, localFormacoes, localCompetencias, localIdiomas, localCertificados, localProjetos, localReferencias]);

  // Save mechanism
  const guardar = async () => {
    if (!activeCvId) return;
    setAGuardar(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("Sessão expirada");

      // 1. Save general data / dados_pessoais
      const newDadosPessoais = { nome, cargo, email, telefone, local, linkedin, resumo };
      const { error: cvError } = await supabase
        .from("curriculos")
        .update({ dados_pessoais: newDadosPessoais })
        .eq("id", activeCvId);
      if (cvError) throw cvError;

      // 2. Save Experiencias
      await supabase.from("experiencias").delete().eq("curriculo_id", activeCvId);
      if (localExperiencias.length > 0) {
        const { error } = await supabase.from("experiencias").insert(
          localExperiencias.map((e, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            empresa: e.empresa,
            cargo: e.cargo,
            descricao: e.descricao || "",
            local: e.local || "",
            data_inicio: e.data_inicio || "",
            data_fim: e.data_fim || "",
            atual: !!e.atual,
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 3. Save Formações
      await supabase.from("formacoes").delete().eq("curriculo_id", activeCvId);
      if (localFormacoes.length > 0) {
        const { error } = await supabase.from("formacoes").insert(
          localFormacoes.map((f, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            instituicao: f.instituicao,
            curso: f.curso,
            nivel: f.nivel || "",
            descricao: f.descricao || "",
            data_inicio: f.data_inicio || "",
            data_fim: f.data_fim || "",
            atual: !!f.atual,
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 4. Save Competencias
      await supabase.from("competencias").delete().eq("curriculo_id", activeCvId);
      if (localCompetencias.length > 0) {
        const { error } = await supabase.from("competencias").insert(
          localCompetencias.map((c, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            nome: c.nome,
            nivel: Number(c.nivel),
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 5. Save Idiomas
      await supabase.from("idiomas").delete().eq("curriculo_id", activeCvId);
      if (localIdiomas.length > 0) {
        const { error } = await supabase.from("idiomas").insert(
          localIdiomas.map((i, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            idioma: i.idioma,
            nivel: i.nivel || "",
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 6. Save Certificados
      await supabase.from("certificados").delete().eq("curriculo_id", activeCvId);
      if (localCertificados.length > 0) {
        const { error } = await supabase.from("certificados").insert(
          localCertificados.map((c, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            nome: c.nome,
            instituicao: c.instituicao || "",
            data: c.data || "",
            url: c.url || "",
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 7. Save Projetos
      await supabase.from("projetos").delete().eq("curriculo_id", activeCvId);
      if (localProjetos.length > 0) {
        const { error } = await supabase.from("projetos").insert(
          localProjetos.map((p, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            nome: p.nome,
            descricao: p.descricao || "",
            url: p.url || "",
            data: p.data || "",
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      // 8. Save Referencias
      await supabase.from("referencias").delete().eq("curriculo_id", activeCvId);
      if (localReferencias.length > 0) {
        const { error } = await supabase.from("referencias").insert(
          localReferencias.map((r, idx) => ({
            curriculo_id: activeCvId,
            user_id: auth.user.id,
            nome: r.nome,
            cargo: r.cargo || "",
            empresa: r.empresa || "",
            telefone: r.telefone || "",
            email: r.email || "",
            ordem: idx,
          }))
        );
        if (error) throw error;
      }

      toast.success("Currículo guardado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["curriculo-editar", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["experiencias", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["formacoes", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["competencias", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["idiomas", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["certificados", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["projetos", activeCvId] });
      queryClient.invalidateQueries({ queryKey: ["referencias", activeCvId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível guardar o currículo.");
    } finally {
      setAGuardar(false);
    }
  };

  const handleNext = () => {
    if (activeStep < 8) {
      setActiveStep(activeStep + 1);
    } else {
      guardar();
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  if (isLoadingCv || isCreating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">A carregar editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel">
              <ArrowLeft className="h-4 w-4" />
              Painel
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={guardar} disabled={aGuardar}>
              <Save className="h-4 w-4" />
              {aGuardar ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_minmax(0,1.2fr)]">
        {/* Forms Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Steps Horizontal Tab Indicator */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {PASSOS.map((p) => {
              const Icon = p.icon;
              const isSelected = activeStep === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveStep(p.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border/75 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] leading-tight hidden sm:block truncate w-full px-0.5">{p.nome}</span>
                </button>
              );
            })}
          </div>

          <Card className="border-border/70 p-6 shadow-soft gap-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-xl font-bold">{PASSOS[activeStep - 1]?.nome}</h2>
              <span className="text-xs font-semibold text-muted-foreground">
                Passo {activeStep} de 8
              </span>
            </div>

            {/* STEP 1: DADOS PESSOAIS */}
            {activeStep === 1 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="Ana Macuácua"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargo">Cargo / Profissão</Label>
                  <Input
                    id="cargo"
                    placeholder="Gestora de Projectos"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ana.macuacua@email.co.mz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="+258 84 123 4567"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="local">Localização (Cidade, País)</Label>
                  <Input
                    id="local"
                    placeholder="Maputo, Moçambique"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="linkedin.com/in/usuario"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: RESUMO */}
            {activeStep === 2 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="resumo">Resumo Profissional</Label>
                  <Textarea
                    id="resumo"
                    rows={8}
                    placeholder="Escreva um breve resumo destacando as suas principais competências, anos de experiência e objectivos profissionais..."
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIÊNCIA PROFISSIONAL */}
            {activeStep === 3 && (
              <div className="grid gap-4">
                {localExperiencias.map((e, idx) => {
                  const isEditing = editExpIdx === idx;
                  return (
                    <Card key={idx} className="border-border/70 p-4 shadow-none">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <div className="grid gap-1.5">
                            <Label>Cargo</Label>
                            <Input
                              value={e.cargo}
                              onChange={(val) => {
                                const newExp = [...localExperiencias];
                                newExp[idx].cargo = val.target.value;
                                setLocalExperiencias(newExp);
                              }}
                              placeholder="Gestor de Operações"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Empresa</Label>
                            <Input
                              value={e.empresa}
                              onChange={(val) => {
                                const newExp = [...localExperiencias];
                                newExp[idx].empresa = val.target.value;
                                setLocalExperiencias(newExp);
                              }}
                              placeholder="Empresa Lda"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1.5">
                              <Label>Início</Label>
                              <Input
                                value={e.data_inicio}
                                onChange={(val) => {
                                  const newExp = [...localExperiencias];
                                  newExp[idx].data_inicio = val.target.value;
                                  setLocalExperiencias(newExp);
                                }}
                                placeholder="Jan 2018"
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label>Fim</Label>
                              <Input
                                value={e.data_fim}
                                disabled={!!e.atual}
                                onChange={(val) => {
                                  const newExp = [...localExperiencias];
                                  newExp[idx].data_fim = val.target.value;
                                  setLocalExperiencias(newExp);
                                }}
                                placeholder="Presente"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id={`atual-${idx}`}
                              checked={!!e.atual}
                              onChange={(val) => {
                                const newExp = [...localExperiencias];
                                newExp[idx].atual = val.target.checked;
                                if (val.target.checked) newExp[idx].data_fim = "";
                                setLocalExperiencias(newExp);
                              }}
                            />
                            <Label htmlFor={`atual-${idx}`}>Trabalho aqui atualmente</Label>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Localização</Label>
                            <Input
                              value={e.local}
                              onChange={(val) => {
                                const newExp = [...localExperiencias];
                                newExp[idx].local = val.target.value;
                                setLocalExperiencias(newExp);
                              }}
                              placeholder="Maputo"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Descrição das Responsabilidades</Label>
                            <Textarea
                              value={e.descricao}
                              onChange={(val) => {
                                const newExp = [...localExperiencias];
                                newExp[idx].descricao = val.target.value;
                                setLocalExperiencias(newExp);
                              }}
                              rows={3}
                              placeholder="Descreva as suas conquistas e responsabilidades..."
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setEditExpIdx(null)}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-sm">{e.cargo || "Sem cargo"}</p>
                            <p className="text-xs text-primary">{e.empresa || "Sem empresa"}</p>
                            <p className="text-xs text-muted-foreground">
                              {e.data_inicio} — {e.atual ? "Presente" : e.data_fim}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditExpIdx(idx)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setLocalExperiencias(localExperiencias.filter((_, i) => i !== idx));
                                setEditExpIdx(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newIdx = localExperiencias.length;
                    setLocalExperiencias([
                      ...localExperiencias,
                      { cargo: "", empresa: "", data_inicio: "", data_fim: "", atual: false, local: "", descricao: "" },
                    ]);
                    setEditExpIdx(newIdx);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Experiência
                </Button>
              </div>
            )}

            {/* STEP 4: FORMAÇÃO ACADÉMICA */}
            {activeStep === 4 && (
              <div className="grid gap-4">
                {localFormacoes.map((f, idx) => {
                  const isEditing = editFormIdx === idx;
                  return (
                    <Card key={idx} className="border-border/70 p-4 shadow-none">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <div className="grid gap-1.5">
                            <Label>Curso</Label>
                            <Input
                              value={f.curso}
                              onChange={(val) => {
                                const newForm = [...localFormacoes];
                                newForm[idx].curso = val.target.value;
                                setLocalFormacoes(newForm);
                              }}
                              placeholder="Licenciatura em Gestão de Empresas"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Instituição de Ensino</Label>
                            <Input
                              value={f.instituicao}
                              onChange={(val) => {
                                const newForm = [...localFormacoes];
                                newForm[idx].instituicao = val.target.value;
                                setLocalFormacoes(newForm);
                              }}
                              placeholder="Universidade Eduardo Mondlane"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Nível académico</Label>
                            <Input
                              value={f.nivel}
                              onChange={(val) => {
                                const newForm = [...localFormacoes];
                                newForm[idx].nivel = val.target.value;
                                setLocalFormacoes(newForm);
                              }}
                              placeholder="Licenciatura / Bacharelato"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1.5">
                              <Label>Ano de início</Label>
                              <Input
                                value={f.data_inicio}
                                onChange={(val) => {
                                  const newForm = [...localFormacoes];
                                  newForm[idx].data_inicio = val.target.value;
                                  setLocalFormacoes(newForm);
                                }}
                                placeholder="2013"
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label>Ano de fim</Label>
                              <Input
                                value={f.data_fim}
                                disabled={!!f.atual}
                                onChange={(val) => {
                                  const newForm = [...localFormacoes];
                                  newForm[idx].data_fim = val.target.value;
                                  setLocalFormacoes(newForm);
                                }}
                                placeholder="2017"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id={`atual-f-${idx}`}
                              checked={!!f.atual}
                              onChange={(val) => {
                                const newForm = [...localFormacoes];
                                newForm[idx].atual = val.target.checked;
                                if (val.target.checked) newForm[idx].data_fim = "";
                                setLocalFormacoes(newForm);
                              }}
                            />
                            <Label htmlFor={`atual-f-${idx}`}>Estudo aqui atualmente</Label>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Notas / Detalhes (Opcional)</Label>
                            <Textarea
                              value={f.descricao}
                              onChange={(val) => {
                                const newForm = [...localFormacoes];
                                newForm[idx].descricao = val.target.value;
                                setLocalFormacoes(newForm);
                              }}
                              rows={2}
                              placeholder="Média final de 16 valores, destaques..."
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setEditFormIdx(null)}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-sm">{f.curso || "Sem curso"}</p>
                            <p className="text-xs text-primary">{f.instituicao || "Sem instituição"}</p>
                            <p className="text-xs text-muted-foreground font-medium">
                              {f.data_inicio} — {f.atual ? "Presente" : f.data_fim}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditFormIdx(idx)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setLocalFormacoes(localFormacoes.filter((_, i) => i !== idx));
                                setEditFormIdx(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newIdx = localFormacoes.length;
                    setLocalFormacoes([
                      ...localFormacoes,
                      { curso: "", instituicao: "", nivel: "", data_inicio: "", data_fim: "", atual: false, descricao: "" },
                    ]);
                    setEditFormIdx(newIdx);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Formação
                </Button>
              </div>
            )}

            {/* STEP 5: COMPETÊNCIAS */}
            {activeStep === 5 && (
              <div className="grid gap-4">
                {localCompetencias.map((c, idx) => {
                  const isEditing = editCompIdx === idx;
                  return (
                    <Card key={idx} className="border-border/70 p-4 shadow-none">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <div className="grid gap-1.5">
                            <Label>Competência</Label>
                            <Input
                              value={c.nome}
                              onChange={(val) => {
                                const newComp = [...localCompetencias];
                                newComp[idx].nome = val.target.value;
                                setLocalCompetencias(newComp);
                              }}
                              placeholder="Gestão de Projectos, Excel, Liderança..."
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Nível: {c.nivel} de 5</Label>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[Number(c.nivel)]}
                              onValueChange={([val]) => {
                                const newComp = [...localCompetencias];
                                newComp[idx].nivel = val ?? 3;
                                setLocalCompetencias(newComp);
                              }}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setEditCompIdx(null)}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">{c.nome || "Sem nome"}</span>
                            <span className="text-xs bg-accent-soft text-primary px-2.5 py-0.5 rounded-full font-medium">
                              Nível {c.nivel}/5
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditCompIdx(idx)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setLocalCompetencias(localCompetencias.filter((_, i) => i !== idx));
                                setEditCompIdx(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newIdx = localCompetencias.length;
                    setLocalCompetencias([
                      ...localCompetencias,
                      { nome: "", nivel: 3 },
                    ]);
                    setEditCompIdx(newIdx);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Competência
                </Button>
              </div>
            )}

            {/* STEP 6: IDIOMAS */}
            {activeStep === 6 && (
              <div className="grid gap-4">
                {localIdiomas.map((i, idx) => {
                  const isEditing = editIdiomaIdx === idx;
                  return (
                    <Card key={idx} className="border-border/70 p-4 shadow-none">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <div className="grid gap-1.5">
                            <Label>Idioma</Label>
                            <Input
                              value={i.idioma}
                              onChange={(val) => {
                                const newId = [...localIdiomas];
                                newId[idx].idioma = val.target.value;
                                setLocalIdiomas(newId);
                              }}
                              placeholder="Português, Inglês, Changana..."
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Nível de proficiência</Label>
                            <Select
                              value={i.nivel}
                              onValueChange={(val) => {
                                const newId = [...localIdiomas];
                                newId[idx].nivel = val;
                                setLocalIdiomas(newId);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Nativo">Nativo / Materno</SelectItem>
                                <SelectItem value="Avançado">Avançado / Fluente</SelectItem>
                                <SelectItem value="Intermédio">Intermédio</SelectItem>
                                <SelectItem value="Básico">Básico / Iniciante</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setEditIdiomaIdx(null)}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="font-semibold text-sm">{i.idioma || "Sem idioma"}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({i.nivel || "Sem nível"})</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditIdiomaIdx(idx)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setLocalIdiomas(localIdiomas.filter((_, idxId) => idxId !== idx));
                                setEditIdiomaIdx(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newIdx = localIdiomas.length;
                    setLocalIdiomas([
                      ...localIdiomas,
                      { idioma: "", nivel: "Intermédio" },
                    ]);
                    setEditIdiomaIdx(newIdx);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Idioma
                </Button>
              </div>
            )}

            {/* STEP 7: CERTIFICADOS */}
            {activeStep === 7 && (
              <div className="grid gap-4">
                {localCertificados.map((c, idx) => {
                  const isEditing = editCertIdx === idx;
                  return (
                    <Card key={idx} className="border-border/70 p-4 shadow-none">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <div className="grid gap-1.5">
                            <Label>Nome do Certificado</Label>
                            <Input
                              value={c.nome}
                              onChange={(val) => {
                                const newCert = [...localCertificados];
                                newCert[idx].nome = val.target.value;
                                setLocalCertificados(newCert);
                              }}
                              placeholder="PMP — Project Management Professional"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Instituição Emissora</Label>
                            <Input
                              value={c.instituicao}
                              onChange={(val) => {
                                const newCert = [...localCertificados];
                                newCert[idx].instituicao = val.target.value;
                                setLocalCertificados(newCert);
                              }}
                              placeholder="Project Management Institute (PMI)"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Data de Emissão (Ano)</Label>
                            <Input
                              value={c.data}
                              onChange={(val) => {
                                const newCert = [...localCertificados];
                                newCert[idx].data = val.target.value;
                                setLocalCertificados(newCert);
                              }}
                              placeholder="2022"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>URL da Credencial (Opcional)</Label>
                            <Input
                              value={c.url}
                              onChange={(val) => {
                                const newCert = [...localCertificados];
                                newCert[idx].url = val.target.value;
                                setLocalCertificados(newCert);
                              }}
                              placeholder="https://credencial.com/valida"
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setEditCertIdx(null)}>
                              Confirmar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-sm">{c.nome || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.instituicao} {c.data ? `· ${c.data}` : ""}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditCertIdx(idx)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setLocalCertificados(localCertificados.filter((_, i) => i !== idx));
                                setEditCertIdx(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newIdx = localCertificados.length;
                    setLocalCertificados([
                      ...localCertificados,
                      { nome: "", instituicao: "", data: "", url: "" },
                    ]);
                    setEditCertIdx(newIdx);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Certificado
                </Button>
              </div>
            )}

            {/* STEP 8: PROJECTOS E REFERÊNCIAS */}
            {activeStep === 8 && (
              <div className="grid gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">Projectos Realizados</h3>
                  <div className="grid gap-3">
                    {localProjetos.map((p, idx) => {
                      const isEditing = editProjIdx === idx;
                      return (
                        <Card key={idx} className="border-border/70 p-4 shadow-none">
                          {isEditing ? (
                            <div className="grid gap-3">
                              <div className="grid gap-1.5">
                                <Label>Nome do Projecto</Label>
                                <Input
                                  value={p.nome}
                                  onChange={(val) => {
                                    const newProj = [...localProjetos];
                                    newProj[idx].nome = val.target.value;
                                    setLocalProjetos(newProj);
                                  }}
                                  placeholder="Website de Vendas"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Descrição</Label>
                                <Textarea
                                  value={p.descricao}
                                  onChange={(val) => {
                                    const newProj = [...localProjetos];
                                    newProj[idx].descricao = val.target.value;
                                    setLocalProjetos(newProj);
                                  }}
                                  rows={2}
                                  placeholder="Uma breve explicação do projecto e tecnologias..."
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => setEditProjIdx(null)}>
                                  Confirmar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-sm">{p.nome || "Sem nome"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{p.descricao}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditProjIdx(idx)}>
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setLocalProjetos(localProjetos.filter((_, i) => i !== idx));
                                    setEditProjIdx(null);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIdx = localProjetos.length;
                        setLocalProjetos([
                          ...localProjetos,
                          { nome: "", descricao: "", url: "" },
                        ]);
                        setEditProjIdx(newIdx);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Projecto
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h3 className="text-sm font-semibold text-primary mb-3">Referências Profissionais</h3>
                  <div className="grid gap-3">
                    {localReferencias.map((r, idx) => {
                      const isEditing = editRefIdx === idx;
                      return (
                        <Card key={idx} className="border-border/70 p-4 shadow-none">
                          {isEditing ? (
                            <div className="grid gap-3">
                              <div className="grid gap-1.5">
                                <Label>Nome do Contacto</Label>
                                <Input
                                  value={r.nome}
                                  onChange={(val) => {
                                    const newRef = [...localReferencias];
                                    newRef[idx].nome = val.target.value;
                                    setLocalReferencias(newRef);
                                  }}
                                  placeholder="Dr. Paulo Nhantumbo"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Cargo</Label>
                                <Input
                                  value={r.cargo}
                                  onChange={(val) => {
                                    const newRef = [...localReferencias];
                                    newRef[idx].cargo = val.target.value;
                                    setLocalReferencias(newRef);
                                  }}
                                  placeholder="Director de Recursos Humanos"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Empresa</Label>
                                <Input
                                  value={r.empresa}
                                  onChange={(val) => {
                                    const newRef = [...localReferencias];
                                    newRef[idx].empresa = val.target.value;
                                    setLocalReferencias(newRef);
                                  }}
                                  placeholder="Empresa Lda"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label>Telefone / E-mail</Label>
                                <Input
                                  value={r.telefone}
                                  onChange={(val) => {
                                    const newRef = [...localReferencias];
                                    newRef[idx].telefone = val.target.value;
                                    setLocalReferencias(newRef);
                                  }}
                                  placeholder="+258 82 000 0000"
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => setEditRefIdx(null)}>
                                  Confirmar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-sm">{r.nome || "Sem nome"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[r.cargo, r.empresa, r.telefone].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditRefIdx(idx)}>
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setLocalReferencias(localReferencias.filter((_, i) => i !== idx));
                                    setEditRefIdx(null);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIdx = localReferencias.length;
                        setLocalReferencias([
                          ...localReferencias,
                          { nome: "", cargo: "", empresa: "", telefone: "" },
                        ]);
                        setEditRefIdx(newIdx);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Referência
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Steps Navigation Controls */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={activeStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button size="sm" onClick={handleNext}>
                {activeStep === 8 ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Finalizar e Guardar
                  </>
                ) : (
                  <>
                    Seguinte
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted p-4 shadow-lift">
            <div className="mx-auto w-full max-w-[794px] overflow-hidden rounded-lg bg-white shadow-soft">
              <div style={{ aspectRatio: "210 / 297" }} className="overflow-hidden">
                <CVPreview
                  modelo={modelo}
                  dados={previewDados}
                  opcoes={opcoes}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
