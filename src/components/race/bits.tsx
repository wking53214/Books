import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-cinnabar uppercase">{children}</p>
  );
}

export function Paper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-l-4 border-l-cinnabar bg-parchment text-ink-text",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-line bg-ink-2", className)}>{children}</section>
  );
}

export function Chip({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "cinnabar" | "sage" | "paper";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center px-2 text-xs font-semibold tracking-wide",
        tone === "ink" && "bg-ink-3 text-fg",
        tone === "cinnabar" && "bg-cinnabar-deep text-parchment",
        tone === "sage" && "bg-sage-deep text-sage",
        tone === "paper" && "bg-paper text-ink-text",
      )}
    >
      {children}
    </span>
  );
}

export function TextButton({
  children,
  onClick,
  disabled,
  tone = "solid",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "solid" | "ghost" | "paper";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        tone === "solid" && "bg-cinnabar-deep text-parchment hover:bg-ink-text",
        tone === "ghost" && "border border-line text-fg hover:border-muted",
        tone === "paper" && "bg-ink-text text-parchment hover:bg-cinnabar-deep",
      )}
    >
      {children}
    </button>
  );
}
