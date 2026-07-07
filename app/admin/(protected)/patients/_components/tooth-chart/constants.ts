import type { ToothCondition } from "@/types";

export const upperJaw = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const lowerJaw = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export const manualConditions: ToothCondition[] = ["healthy", "caries", "missing", "crown", "implant"];

export const LONG_PRESS_MS = 500;
export const TOOTH_VB = "0 0 20 28";

export const conditionLabel: Record<ToothCondition, string> = {
  healthy: "Zdrav",
  caries:  "Karijes",
  missing: "Nedostaje",
  crown:   "Krunica",
  implant: "Implant",
  treated: "Sanirano",
};

export const conditionSvg: Record<ToothCondition, { fill: string; stroke: string; opacity?: string }> = {
  healthy: { fill: "white",          stroke: "#94a3b8" },
  caries:  { fill: "#fbbf24",        stroke: "#b45309" },
  missing: { fill: "none",           stroke: "#94a3b8", opacity: "0.45" },
  crown:   { fill: "#38bdf8",        stroke: "#0369a1" },
  implant: { fill: "#a78bfa",        stroke: "#6d28d9" },
  treated: { fill: "var(--primary)", stroke: "var(--primary)" },
};

export type ToothType = "incisor" | "canine" | "premolar" | "molar";

export function toothType(n: number): ToothType {
  const d = n % 10;
  if (d <= 2) return "incisor";
  if (d === 3) return "canine";
  if (d <= 5) return "premolar";
  return "molar";
}

export const toothBasis: Record<ToothType, number> = {
  incisor:  5.2,
  canine:   5.4,
  premolar: 6.0,
  molar:    7.1,
};

export const archTransform = [
  "rotate(-22deg) translateY(7px)",
  "rotate(-16deg) translateY(5px)",
  "rotate(-11deg) translateY(3px)",
  "rotate(-6deg)  translateY(1.5px)",
  "rotate(-3deg)  translateY(0.5px)",
  "rotate(-1deg)  translateY(0)",
  "rotate(0deg)   translateY(0)",
  "rotate(0deg)   translateY(0)",
  "rotate(0deg)   translateY(0)",
  "rotate(0deg)   translateY(0)",
  "rotate(1deg)   translateY(0)",
  "rotate(3deg)   translateY(0.5px)",
  "rotate(6deg)   translateY(1.5px)",
  "rotate(11deg)  translateY(3px)",
  "rotate(16deg)  translateY(5px)",
  "rotate(22deg)  translateY(7px)",
];

export const serviceOptions = [
  "Kontrola",
  "Plomba",
  "Ekstrakcija",
  "Krunica",
  "Implant",
  "Izbeljivanje",
  "Ortodoncija",
  "Čišćenje",
  "Ostalo",
];