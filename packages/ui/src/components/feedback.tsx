import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../cn";

type AlertTone = "info" | "success" | "warning" | "danger";

const alertStyles: Record<AlertTone, { box: string; icon: LucideIcon }> = {
  info: { box: "bg-info-soft text-info", icon: Info },
  success: { box: "bg-success-soft text-success", icon: CircleCheck },
  warning: { box: "bg-warning-soft text-warning", icon: TriangleAlert },
  danger: { box: "bg-danger-soft text-danger", icon: CircleAlert },
};

export interface AlertProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, action, className }: AlertProps) {
  const { box, icon: Icon } = alertStyles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md p-4", box, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** Estado vacío que explica qué pasará o qué hacer. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-heading font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
