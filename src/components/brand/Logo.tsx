import logoFull from "@/assets/logo-full.png.asset.json";
import logoMark from "@/assets/logo-mark.png.asset.json";
import { cn } from "@/lib/utils";

/** Marca Moz Carreira — lockup horizontal ou apenas o símbolo. */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const asset = variant === "mark" ? logoMark : logoFull;
  return (
    <img
      src={asset.url}
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
