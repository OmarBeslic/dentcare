import type { ToothCondition } from "@/types";
import { conditionLabel, conditionSvg } from "./constants";

export function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {(Object.keys(conditionLabel) as ToothCondition[]).map((c) => {
        const cs = conditionSvg[c];
        return (
          <div key={c} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg width="10" height="13" viewBox="2 0 16 28" className="shrink-0">
              <path
                d="M4,1 Q10,-0.5 16,1 L17,24 Q17,27 13.5,27 L6.5,27 Q3,27 3,24 Z"
                fill={cs.fill}
                stroke={cs.stroke}
                strokeWidth="1.8"
                strokeDasharray={c === "missing" ? "3 2" : undefined}
                opacity={c === "missing" ? "0.5" : "1"}
              />
            </svg>
            {conditionLabel[c]}
            {c === "treated" && (
              <span className="text-[10px] text-muted-foreground/60">(bijela tačka)</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
