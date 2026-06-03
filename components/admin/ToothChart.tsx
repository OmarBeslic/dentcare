"use client";

import { cn } from "@/lib/utils";
import type { ToothState, ToothChart as ToothChartType } from "@/types";

const states: ToothState[] = ["healthy", "caries", "missing", "crown", "implant"];
const stateLabels: Record<ToothState, string> = {
  healthy: "OK",
  caries: "Karijes",
  missing: "Nedostaje",
  crown: "Krunica",
  implant: "Implantat",
};
const stateColors: Record<ToothState, string> = {
  healthy: "bg-green-100 text-green-700 border-green-300",
  caries: "bg-yellow-100 text-yellow-700 border-yellow-300",
  missing: "bg-red-100 text-red-600 border-red-300",
  crown: "bg-blue-100 text-blue-700 border-blue-300",
  implant: "bg-purple-100 text-purple-700 border-purple-300",
};

// Upper jaw: 18-11, 21-28
// Lower jaw: 48-41, 31-38
const upperJaw = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerJaw = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

interface ToothChartProps {
  value: ToothChartType;
  onChange?: (chart: ToothChartType) => void;
  readOnly?: boolean;
}

export function ToothChart({ value, onChange, readOnly = false }: ToothChartProps) {
  function cycleState(tooth: number) {
    if (readOnly || !onChange) return;
    const key = String(tooth);
    const current = value[key] as ToothState | undefined;
    const idx = current ? states.indexOf(current) : 0;
    const next = states[(idx + 1) % states.length];
    if (next === "healthy") {
      const { [key]: _, ...rest } = value;
      onChange(rest);
    } else {
      onChange({ ...value, [key]: next });
    }
  }

  function renderTooth(tooth: number) {
    const state = (value[String(tooth)] as ToothState) ?? "healthy";
    return (
      <button
        key={tooth}
        type="button"
        onClick={() => cycleState(tooth)}
        disabled={readOnly}
        title={`${tooth}: ${stateLabels[state]}`}
        className={cn(
          "flex flex-col items-center justify-center border rounded text-xs font-medium transition-all",
          "w-7 h-9 sm:w-8 sm:h-10",
          readOnly ? "cursor-default" : "cursor-pointer hover:scale-105 active:scale-95",
          stateColors[state]
        )}
      >
        <span className="text-[9px] leading-none opacity-60">{tooth}</span>
        <span className="leading-none mt-0.5">{state === "missing" ? "×" : state === "crown" ? "♦" : state === "implant" ? "▲" : state === "caries" ? "●" : "○"}</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {states.map((s) => (
          <span key={s} className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", stateColors[s])}>
            {stateLabels[s]}
          </span>
        ))}
      </div>
      {!readOnly && <p className="text-xs text-muted-foreground">Kliknite na zub da promenite stanje.</p>}

      {/* Upper jaw */}
      <div>
        <p className="text-xs text-muted-foreground mb-1 text-center">Gornja vilica</p>
        <div className="flex justify-center gap-0.5 flex-wrap">
          {upperJaw.map(renderTooth)}
        </div>
      </div>

      {/* Lower jaw */}
      <div>
        <p className="text-xs text-muted-foreground mb-1 text-center">Donja vilica</p>
        <div className="flex justify-center gap-0.5 flex-wrap">
          {lowerJaw.map(renderTooth)}
        </div>
      </div>
    </div>
  );
}
