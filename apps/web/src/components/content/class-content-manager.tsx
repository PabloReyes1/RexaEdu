"use client";

import { useState } from "react";
import type { ContentGroup } from "@/demo/content";
import { ContentEditor, type PublishTarget } from "./content-editor";

/** Estado local del contenido de una clase (en producción: API `/teacher/classes/:id/content`). */
export function ClassContentManager({
  initial,
  publishTargets,
}: {
  initial: ContentGroup[];
  publishTargets: PublishTarget[];
}) {
  const [groups, setGroups] = useState(initial);
  return (
    <ContentEditor
      groups={groups}
      onChange={setGroups}
      groupNoun="unidad"
      publishTargets={publishTargets}
      audienceLabel="tus alumnos"
    />
  );
}
