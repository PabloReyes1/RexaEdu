import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleX,
  Clock,
  RotateCcw,
  TriangleAlert,
  Upload,
  type LucideIcon,
} from "lucide-react";
import {
  formatGrade,
  gradeTone,
  gradeToneMeta,
  submissionStatusMeta,
  type GradeScale,
  type GradeTone,
  type SubmissionStatus,
} from "../academic";
import { cn } from "../cn";
import { Badge } from "./badge";

const submissionIcons: Record<SubmissionStatus, LucideIcon> = {
  pendiente: CircleDashed,
  entregada: Upload,
  tarde: Clock,
  no_entregada: CircleX,
  devuelta: RotateCcw,
  calificada: CircleCheck,
  exonerada: CircleMinus,
};

/** Estado de una entrega: siempre color + icono + texto (nunca solo color). */
export function SubmissionStatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  const meta = submissionStatusMeta[status];
  const Icon = submissionIcons[status];
  return (
    <Badge tone={meta.tone} className={className}>
      <Icon aria-hidden />
      {meta.label}
    </Badge>
  );
}

const gradeIcons: Record<GradeTone, LucideIcon> = {
  aprobado: CircleCheck,
  riesgo: TriangleAlert,
  reprobado: CircleAlert,
};

export interface GradePillProps extends GradeScale {
  score: number;
  decimals?: number;
  /** Muestra la etiqueta "Aprobado / En riesgo / Reprobado" visible. */
  showLabel?: boolean;
  className?: string;
}

/** Nota con semáforo accesible. */
export function GradePill({
  score,
  passing,
  riskMargin,
  decimals = 1,
  showLabel = false,
  className,
}: GradePillProps) {
  const tone = gradeTone(score, { passing, riskMargin });
  const meta = gradeToneMeta[tone];
  const Icon = gradeIcons[tone];
  return (
    <Badge tone={meta.tone} className={cn("text-sm tabular-nums", className)}>
      <Icon aria-hidden />
      <span>{formatGrade(score, decimals)}</span>
      {showLabel ? (
        <span className="font-medium">· {meta.label}</span>
      ) : (
        <span className="sr-only">{meta.label}</span>
      )}
    </Badge>
  );
}
