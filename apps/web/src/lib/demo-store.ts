import "server-only";

import type { SubmissionStatus } from "@rexaedu/ui";
import {
  isVisibleTo,
  seedAnnouncements,
  sortAnnouncements,
  type FeedAnnouncement,
} from "@/demo/announcements";
import type { ContentGroup } from "@/demo/content";
import { canViewForum, seedForums, type Forum } from "@/demo/forums";
import { CLOSED_PERIODS, viewablePeriod, type Period, type PeriodId } from "@/demo/periods";
import type { Viewer } from "@/demo/viewer";

/**
 * Estado compartido entre portales mientras no exista la API: anuncios, foros,
 * permisos de edición de bimestres finalizados y lo que se modificó con ellos.
 * Vive en la memoria del servidor (se reinicia al reiniciarlo) y se reemplaza por
 * la base de datos de docs/06.
 */

export interface PeriodGrant {
  periodId: PeriodId;
  classId: string;
  grantedBy: string;
  at: Date;
}

export interface PeriodLogEvent {
  id: string;
  text: string;
  by: string;
  at: Date;
}

/** Nota modificada en un bimestre finalizado. */
export interface PastGradeEdit {
  status: SubmissionStatus;
  points?: number;
}

interface DemoStore {
  announcements: FeedAnnouncement[];
  forums: Forum[];
  grants: PeriodGrant[];
  periodLog: PeriodLogEvent[];
  /** Por `pastGradeKey`. */
  pastGrades: Map<string, PastGradeEdit>;
  /** Por `pastContentKey`: reemplaza al material original de ese bimestre y clase. */
  pastContent: Map<string, ContentGroup[]>;
  seq: number;
}

export const pastGradeKey = (studentId: string, activityId: string) => `${studentId}|${activityId}`;

export const pastContentKey = (periodId: PeriodId, classKey: string) => `${periodId}|${classKey}`;

// En `globalThis` para que las acciones y las páginas compartan la misma instancia.
const holder = globalThis as typeof globalThis & { __rexaeduDemoStore?: DemoStore };

export function demoStore(): DemoStore {
  if (!holder.__rexaeduDemoStore) {
    const now = new Date();
    holder.__rexaeduDemoStore = {
      announcements: seedAnnouncements(now),
      forums: seedForums(now),
      grants: [],
      periodLog: [],
      pastGrades: new Map(),
      pastContent: new Map(),
      seq: 0,
    };
  }
  return holder.__rexaeduDemoStore;
}

export function newId(prefix: string): string {
  return `${prefix}-n${++demoStore().seq}`;
}

/* ───────────── Anuncios ───────────── */

export function announcementsFor(v: Viewer): FeedAnnouncement[] {
  return sortAnnouncements(demoStore().announcements.filter((a) => isVisibleTo(a, v)));
}

export function announcementFor(v: Viewer, id: string): FeedAnnouncement | undefined {
  return announcementsFor(v).find((a) => a.id === id);
}

/* ───────────── Foros ───────────── */

export function forumsFor(v: Viewer): Forum[] {
  return demoStore().forums.filter((f) => canViewForum(f, v));
}

export function forumFor(v: Viewer, id: string): Forum | undefined {
  return forumsFor(v).find((f) => f.id === id);
}

/* ───────────── Bimestres ───────────── */

export function periodGrant(periodId: PeriodId, classId: string): PeriodGrant | undefined {
  return demoStore().grants.find((g) => g.periodId === periodId && g.classId === classId);
}

export function grantsForClasses(classIds: string[]): PeriodGrant[] {
  return demoStore().grants.filter((g) => classIds.includes(g.classId));
}

export interface ClassPeriodAccess {
  period: Period;
  closed: boolean;
  /** Un bimestre finalizado solo se edita con permiso de administración. */
  canEdit: boolean;
  grant?: PeriodGrant;
}

export function classPeriodAccess(classId: string, rawPeriod?: string): ClassPeriodAccess {
  const period = viewablePeriod(rawPeriod);
  const closed = CLOSED_PERIODS.some((p) => p.id === period.id);
  const grant = closed ? periodGrant(period.id, classId) : undefined;
  return { period, closed, canEdit: !closed || !!grant, grant };
}
