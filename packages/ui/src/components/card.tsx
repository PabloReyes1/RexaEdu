import type { HTMLAttributes } from "react";
import { cn } from "../cn";

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Contenedor base. Borde, radio, sombra y relleno dependen del tema. */
export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-(length:--rx-card-border) border-border bg-surface text-foreground shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-(--rx-card-padding) pb-0", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-heading text-lg leading-tight font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-(--rx-card-padding)", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-(--rx-card-padding) py-3",
        className,
      )}
      {...props}
    />
  );
}
