import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Modo = "entrar" | "registo" | "recuperar";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    modo: (["entrar", "registo", "recuperar"] as const).includes(search["modo"] as Modo)
      ? (search["modo"] as Modo)
      : ("entrar" as Modo),
  }),
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Moz Carreira" },
      {
        name: "description",
        content:
          "Aceda à sua conta Moz Carreira para criar, editar e exportar os seus currículos profissionais.",
      },
      { property: "og:title", content: "Entrar na Moz Carreira" },
      {
        property: "og:description",
        content: "Crie a sua conta gratuita e comece o seu currículo profissional hoje.",
      },
    ],
  }),
  component: AuthPage,
});

const entrarSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

const registoSchema = entrarSchema.extend({
  nome: z.string().trim().min(2, "Indique o seu nome").max(100),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
});

const recuperarSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const schema = modo === "registo" ? registoSchema : modo === "recuperar" ? recuperarSchema : entrarSchema;

  const form = useForm<{ email: string; password?: string; nome?: string; telefone?: string }>({
    resolver: zodResolver(schema as never),
    defaultValues: { email: "", password: "", nome: "", telefone: "" },
  });

  const setModo = (m: Modo) => {
    setEmailEnviado(null);
    form.reset({ email: "", password: "", nome: "", telefone: "" });
    navigate({ to: "/auth", search: { modo: m } });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password!,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/painel" });
        return;
      }

      if (modo === "registo") {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password!,
          options: {
            emailRedirectTo: `${window.location.origin}/painel`,
            data: { nome: values.nome, telefone: values.telefone },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada com sucesso! Bem-vindo(a).");
          navigate({ to: "/painel" });
        } else {
          toast.warning("A confirmação de e-mail está ativa no Supabase. Por favor, confirme o seu e-mail para entrar.");
          setEmailEnviado(values.email);
        }
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) throw error;
      setEmailEnviado(values.email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      toast.error(
        msg.includes("Invalid login credentials")
          ? "Email ou palavra-passe incorrectos."
          : msg.includes("already registered")
            ? "Este email já tem conta. Faça login."
            : msg,
      );
    }
  });

  const entrarComGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="w-fit rounded-xl bg-background/95 px-4 py-2">
          <Logo className="h-8" />
        </Link>
        <div>
          <h2 className="max-w-sm text-4xl leading-tight font-extrabold text-primary-foreground">
            O seu caminho. O seu futuro. O seu sucesso.
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/80">
            Currículos profissionais, modelos elegantes e inteligência artificial — tudo num só
            lugar.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Moz Carreira
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo className="h-8" />
          </Link>

          {emailEnviado ? (
            <Card className="items-center gap-4 p-8 text-center shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Mail className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-bold">Verifique o seu email</h1>
              <p className="text-sm text-muted-foreground">
                Enviámos uma mensagem para <strong>{emailEnviado}</strong>. Siga o link para
                {modo === "recuperar" ? " definir uma nova palavra-passe." : " confirmar a conta."}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setModo("entrar")}>
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Button>
            </Card>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                {modo === "registo"
                  ? "Criar conta"
                  : modo === "recuperar"
                    ? "Recuperar palavra-passe"
                    : "Entrar"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {modo === "registo"
                  ? "Comece grátis e crie o seu primeiro currículo hoje."
                  : modo === "recuperar"
                    ? "Enviamos um link para redefinir a sua palavra-passe."
                    : "Bem-vindo de volta à Moz Carreira."}
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                {modo === "registo" && (
                  <>
                    <Field
                      label="Nome completo"
                      error={form.formState.errors.nome?.message}
                      {...form.register("nome")}
                      placeholder="Ana Macuácua"
                    />
                    <Field
                      label="Telefone (opcional)"
                      error={form.formState.errors.telefone?.message}
                      {...form.register("telefone")}
                      placeholder="+258 84 000 0000"
                    />
                  </>
                )}

                <Field
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={form.formState.errors.email?.message}
                  {...form.register("email")}
                  placeholder="voce@exemplo.com"
                />

                {modo !== "recuperar" && (
                  <Field
                    label="Palavra-passe"
                    type="password"
                    autoComplete={modo === "registo" ? "new-password" : "current-password"}
                    error={form.formState.errors.password?.message}
                    {...form.register("password")}
                    placeholder="••••••••"
                  />
                )}

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modo === "registo"
                    ? "Criar conta"
                    : modo === "recuperar"
                      ? "Enviar link"
                      : "Entrar"}
                </Button>
              </form>

              {modo !== "recuperar" && (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    ou
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={entrarComGoogle}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continuar com Google
                  </Button>
                </>
              )}

              <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
                {modo === "entrar" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModo("recuperar")}
                      className="transition-smooth hover:text-foreground"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                    <p>
                      Não tem conta?{" "}
                      <button
                        type="button"
                        onClick={() => setModo("registo")}
                        className="font-semibold text-primary hover:underline"
                      >
                        Criar conta
                      </button>
                    </p>
                  </>
                )}
                {modo !== "entrar" && (
                  <p>
                    Já tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => setModo("entrar")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Field = ({
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; error?: string | undefined }) => (
  <div className="space-y-1.5">
    <Label htmlFor={props.name}>{label}</Label>
    <Input id={props.name} {...props} />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
