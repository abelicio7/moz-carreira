import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir palavra-passe — Moz Carreira" },
      {
        name: "description",
        content: "Defina uma nova palavra-passe para a sua conta Moz Carreira.",
      },
      { property: "og:title", content: "Redefinir palavra-passe — Moz Carreira" },
      { property: "og:description", content: "Defina uma nova palavra-passe em segurança." },
    ],
  }),
  component: RedefinirSenha,
});

const schema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
    confirmar: z.string(),
  })
  .refine((v) => v.password === v.confirmar, {
    message: "As palavras-passe não coincidem",
    path: ["confirmar"],
  });

function RedefinirSenha() {
  const navigate = useNavigate();
  const [concluido, setConcluido] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmar: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setConcluido(true);
    toast.success("Palavra-passe actualizada.");
    setTimeout(() => navigate({ to: "/painel" }), 900);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <Card className="w-full max-w-sm gap-6 p-8 shadow-lift">
        <Logo className="h-8 self-start" />
        <div>
          <h1 className="text-xl font-bold">Nova palavra-passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma palavra-passe segura para a sua conta.
          </p>
        </div>
        {concluido ? (
          <p className="text-sm text-accent">Tudo pronto. A redireccionar para o painel…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar">Confirmar palavra-passe</Label>
              <Input id="confirmar" type="password" {...form.register("confirmar")} />
              {form.formState.errors.confirmar && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmar.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
