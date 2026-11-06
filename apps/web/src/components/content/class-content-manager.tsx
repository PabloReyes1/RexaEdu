"use client";

import { Alert } from "@rexaedu/ui";
import { useRef, useState, useTransition } from "react";
import type { ContentGroup } from "@/demo/content";
import { ContentEditor, type PublishTarget } from "./content-editor";

/**
 * Contenido de una clase. Con `onSave` (bimestre finalizado con permiso) cada cambio
 * se guarda en el servidor; sin él, queda en el estado local de la página
 * (en producción: API `/teacher/classes/:id/content`).
 */
export function ClassContentManager({
  initial,
  publishTargets,
  onSave,
}: {
  initial: ContentGroup[];
  publishTargets: PublishTarget[];
  onSave?: (groups: ContentGroup[]) => Promise<void>;
}) {
  const [groups, setGroups] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [, startSaving] = useTransition();
  const lastSaved = useRef(initial);

  function change(next: ContentGroup[]) {
    setGroups(next);
    if (!onSave) return;
    setFailed(false);
    startSaving(async () => {
      try {
        await onSave(next);
        lastSaved.current = next;
      } catch {
        setGroups(lastSaved.current);
        setFailed(true);
      }
    });
  }

  return (
    <>
      {failed ? (
        <Alert tone="danger" title="No se guardó el último cambio" className="mb-(--rx-gap)">
          Es posible que administración haya retirado el permiso de edición. Recarga la página para
          comprobarlo.
        </Alert>
      ) : null}
      <ContentEditor
        groups={groups}
        onChange={change}
        groupNoun="unidad"
        publishTargets={publishTargets}
        audienceLabel="tus alumnos"
      />
    </>
  );
}
