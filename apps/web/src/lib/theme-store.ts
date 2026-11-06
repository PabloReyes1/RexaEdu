"use client";

import { useSyncExternalStore } from "react";
import { MODE_STORAGE_KEY, THEME_STORAGE_KEY, type ColorMode } from "./theme";

/*
 * El tema y el modo viven en <html> (data-theme y la clase .dark) y en
 * localStorage. Este pequeño almacén permite a React leerlos sin duplicarlos
 * en estado propio.
 */

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readMode() === "system") applyMode("system");
  };
  mq.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    mq.removeEventListener("change", onSystemChange);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Almacenamiento no disponible (modo privado): el cambio solo dura esta visita.
  }
}

function readMode(): ColorMode {
  try {
    const m = localStorage.getItem(MODE_STORAGE_KEY);
    return m === "light" || m === "dark" ? m : "system";
  } catch {
    return "system";
  }
}

function applyMode(mode: ColorMode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function setThemeId(id: string) {
  document.documentElement.setAttribute("data-theme", id);
  save(THEME_STORAGE_KEY, id);
  emit();
}

export function setColorMode(mode: ColorMode) {
  applyMode(mode);
  save(MODE_STORAGE_KEY, mode);
  emit();
}

export function useThemeId(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute("data-theme"),
    () => null,
  );
}

export function useColorMode(): ColorMode | null {
  return useSyncExternalStore(subscribe, readMode, () => null);
}
