import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FilePlus2,
  FolderOpen,
  Mail,
  Heart,
  LayoutTemplate,
  Settings,
  User as UserIcon,
  Crown,
  LogOut,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — Moz Carreira" },
      {
        name: "description",
        content: "Gira os seus currículos, cartas e definições na Moz Carreira.",
      },
      { property: "og:title", content: "Painel — Moz Carreira" },
      { property: "og:description", content: "Os seus currículos e cartas num só lugar." },
    ],
  }),
  component: Painel,
});

const accoes: {
  icon: typeof FilePlus2;
  titulo: string;
  texto: string;
  destaque?: boolean;
  para?: "/modelos" | "/personalizar" | "/editar-cv" | "/gerar-carta";
  searchTipo?: "apresentacao" | "motivacao";
}[] = [
  { icon: LayoutTemplate, titulo: "Modelos", texto: "12 modelos profissionais", destaque: true, para: "/modelos" },
  { icon: Sparkles, titulo: "Personalizar", texto: "Cores, tipografia, espaçamento e secções", destaque: true, para: "/personalizar" },
  { icon: FilePlus2, titulo: "Criar Currículo", texto: "Comece do zero em 8 passos guiados", para: "/editar-cv" },
  { icon: FolderOpen, titulo: "Meus Currículos", texto: "Editar, duplicar e exportar" },
  { icon: Mail, titulo: "Carta de Apresentação", texto: "Gerada a partir do seu currículo", para: "/gerar-carta", searchTipo: "apresentacao" },
  { icon: Heart, titulo: "Carta de Motivação", texto: "Para bolsas e candidaturas", para: "/gerar-carta", searchTipo: "motivacao" },
  { icon: UserIcon, titulo: "Perfil", texto: "Os seus dados pessoais" },
  { icon: Crown, titulo: "Plano", texto: "Gerir subscrição e limites" },
  { icon: Settings, titulo: "Configurações", texto: "Tema, idioma e preferências" },
];

function Painel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: perfil } = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("nome, email, plano")
        .eq("id", auth.user.id)
        .maybeSingle();
      return data ?? { nome: "", email: auth.user.email ?? "", plano: "gratuito" as const };
    },
  });

  const { data: curriculos } = useQuery({
    queryKey: ["curriculos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("curriculos")
        .select("id, titulo, status, updated_at")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const sair = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { modo: "entrar" }, replace: true });
  };

  const primeiroNome = (perfil?.nome || perfil?.email || "").split(" ")[0] || "candidato";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
          <Link to="/" className="flex min-w-0 items-center">
            <Logo className="h-8" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Badge variant={perfil?.plano === "premium" ? "default" : "secondary"}>
              {perfil?.plano === "premium" ? "Premium" : "Gratuito"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={sair}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-rise">
          <p className="text-sm text-muted-foreground">Bem-vindo</p>
          <h1 className="mt-1 text-3xl font-extrabold capitalize sm:text-4xl">{primeiroNome} 👋</h1>
          <p className="mt-2 text-muted-foreground">
            {curriculos && curriculos.length > 0
              ? `Tem ${curriculos.length} currículo${curriculos.length > 1 ? "s" : ""} guardado${curriculos.length > 1 ? "s" : ""}.`
              : "Ainda não tem currículos. Vamos criar o primeiro?"}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accoes.map((a) => {
            const conteudo = (
              <Card
                className={`group h-full cursor-pointer gap-3 border-border/70 p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-lift ${
                  a.destaque ? "bg-gradient-soft border-primary/25" : ""
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    a.destaque ? "bg-accent text-accent-foreground" : "bg-primary-soft text-primary"
                  }`}
                >
                  <a.icon className="h-5 w-5" />
                </span>
                <h2 className="text-base font-semibold">{a.titulo}</h2>
                <p className="text-sm text-muted-foreground">{a.texto}</p>
              </Card>
            );
            return a.para === "/modelos" ? (
              <Link key={a.titulo} to="/modelos">
                {conteudo}
              </Link>
            ) : a.para === "/personalizar" ? (
              <Link key={a.titulo} to="/personalizar" search={{}}>
                {conteudo}
              </Link>
            ) : a.para === "/editar-cv" ? (
              <Link key={a.titulo} to="/editar-cv" search={{}}>
                {conteudo}
              </Link>
            ) : a.para === "/gerar-carta" ? (
              <Link key={a.titulo} to="/gerar-carta" search={{ tipo: a.searchTipo as any }}>
                {conteudo}
              </Link>
            ) : (
              <div key={a.titulo}>{conteudo}</div>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Currículos recentes</h2>
          {curriculos && curriculos.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {curriculos.map((c) => (
                <Link key={c.id} to="/editar-cv" search={{ cv: c.id }} className="block">
                  <Card
                    className="flex-row items-center justify-between gap-4 border-border/70 p-4 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lift cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Actualizado em {new Date(c.updated_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {c.status}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="mt-4 items-center gap-3 border-dashed p-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="font-semibold">O seu primeiro currículo está a um clique</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                O construtor guiado e a pré-visualização em tempo real chegam na próxima fase.
              </p>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
