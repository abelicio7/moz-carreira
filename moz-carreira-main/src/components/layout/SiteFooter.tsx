import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            O seu caminho. O seu futuro. O seu sucesso.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Moz Carreira · Feito em Moçambique
        </p>
      </div>
    </footer>
  );
}
