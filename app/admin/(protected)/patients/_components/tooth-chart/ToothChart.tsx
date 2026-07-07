"use client";

import { useState } from "react";
import type { ToothCondition } from "@/types";
import { upperJaw, lowerJaw } from "./constants";
import { Tooth } from "./Tooth";
import { ChartLegend } from "./ChartLegend";

export interface ToothChartProps {
  patientId: string;
  chartData: Record<string, ToothCondition>;
  treatedTeeth: number[];
  selectedTooth: number | null;
  onToothClick: (tooth: number) => void;
  onToothConditionChange: (tooth: number, condition: ToothCondition) => void;
  readOnly?: boolean;
}

export function ToothChart({
  chartData,
  treatedTeeth,
  selectedTooth,
  onToothClick,
  onToothConditionChange,
  readOnly = false,
}: ToothChartProps) {
  // Lifted so at most one popover is open at a time across all 32 teeth.
  const [menuTooth, setMenuTooth] = useState<number | null>(null);

  function renderJaw(teeth: number[], isLower: boolean) {
    return (
      <div className="relative flex items-end justify-center overflow-visible" style={{ gap: "1px" }}>
        {/* Midline at z-0 — selected tooth (z-20) renders on top of it */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-0"
          style={{ width: "1.5px", background: "var(--border)" }}
        />
        {teeth.map((tooth, i) => (
          <Tooth
            key={tooth}
            tooth={tooth}
            condition={chartData[String(tooth)] ?? "healthy"}
            isTreated={treatedTeeth.includes(tooth)}
            isSelected={tooth === selectedTooth}
            colIndex={i}
            isLower={isLower}
            readOnly={readOnly}
            menuOpen={menuTooth === tooth}
            onMenuOpen={() => setMenuTooth(tooth)}
            onMenuClose={() => setMenuTooth(null)}
            onToothClick={onToothClick}
            onToothConditionChange={onToothConditionChange}
          />
        ))}
      </div>
    );
  }

  return (
    // max-w-2xl constrains the chart on desktop; mx-auto centres it (fix #2)
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-4 space-y-1 overflow-visible">
        {/* L / R orientation header */}
        <div className="flex text-[9px] font-semibold text-muted-foreground uppercase tracking-widest select-none mb-1">
          <div className="flex-1 text-left pl-1">← Desno</div>
          <div className="flex-1 text-right pr-1">Lijevo →</div>
        </div>

        {/* Upper jaw */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide w-7 shrink-0 text-center select-none">
            Gor.
          </span>
          <div className="flex-1 overflow-visible">{renderJaw(upperJaw, false)}</div>
        </div>

        {/* Occlusal separator */}
        <div className="flex items-center gap-1.5 my-0.5">
          <span className="w-7 shrink-0" />
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 border-t-2 border-dashed border-primary/25" />
            <span className="text-[7px] text-muted-foreground/50 select-none shrink-0">okluzija</span>
            <div className="flex-1 border-t-2 border-dashed border-primary/25" />
          </div>
        </div>

        {/* Lower jaw */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide w-7 shrink-0 text-center select-none">
            Don.
          </span>
          <div className="flex-1 overflow-visible">{renderJaw(lowerJaw, true)}</div>
        </div>
      </div>

      <ChartLegend />

      {!readOnly && (
        <p className="text-xs text-muted-foreground">
          Klik za filtriranje tretmana · desni klik ili dugi pritisak za promenu stanja zuba.
        </p>
      )}
    </div>
  );
}
