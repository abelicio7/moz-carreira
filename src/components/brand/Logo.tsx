import { cn } from "@/lib/utils";

/** Marca Moz Carreira — lockup horizontal ou apenas o símbolo. */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const src = variant === "mark" ? "/logo-mark.png" : "/logo-full.png";
  return (
    <img
      src={src}
      alt="Moz Carreira"
      className={cn(
        "select-none object-contain",
        variant === "mark" ? "h-9 w-auto" : "h-9 w-auto",
        className,
      )}
      loading="eager"
    />
  );
}
