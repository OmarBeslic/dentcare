"use client";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { ToothCondition } from "@/types";
import {
  conditionLabel,
  conditionSvg,
  manualConditions,
  toothBasis,
  archTransform,
  toothType,
} from "./constants";
import { ToothShape } from "./ToothShape";
import { useLongPress } from "./use-long-press";

interface ToothProps {
  tooth: number;
  condition: ToothCondition;
  isTreated: boolean;
  isSelected: boolean;
  colIndex: number;
  isLower: boolean;
  readOnly: boolean;
  menuOpen: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
  onToothClick: (tooth: number) => void;
  onToothConditionChange: (tooth: number, condition: ToothCondition) => void;
}

export function Tooth({
  tooth,
  condition,
  isTreated,
  isSelected,
  colIndex,
  isLower,
  readOnly,
  menuOpen,
  onMenuOpen,
  onMenuClose,
  onToothClick,
  onToothConditionChange,
}: ToothProps) {
  const isMissing = condition === "missing";
  const type = toothType(tooth);

  const lp = useLongPress(onMenuOpen, readOnly);

  function handleClick() {
    if (lp.fired.current) {
      lp.fired.current = false;
      return;
    }
    onToothClick(tooth);
  }

  return (
    <Popover open={menuOpen} onOpenChange={(open) => !open && onMenuClose()}>
      <PopoverAnchor asChild>
        <div
          style={{
            flexBasis: `${toothBasis[type]}%`,
            flexShrink: 0,
            transform: archTransform[colIndex],
            zIndex: isSelected ? 20 : 1,
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={handleClick}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!readOnly) onMenuOpen();
            }}
            onPointerDown={lp.onPointerDown}
            onPointerUp={lp.onPointerUp}
            onPointerLeave={lp.onPointerLeave}
            disabled={readOnly}
            aria-label={`Zub ${tooth}: ${conditionLabel[condition]}`}
            aria-pressed={isSelected}
            title={`Zub ${tooth}: ${conditionLabel[condition]}`}
            className={cn(
              "relative w-full block transition-all duration-150",
              !readOnly &&
                !isMissing &&
                "cursor-pointer hover:drop-shadow-md hover:-translate-y-0.5 active:translate-y-0",
              readOnly && "cursor-default",
              isSelected &&
                "outline outline-offset-[3px] outline-primary drop-shadow-[0_0_6px_color-mix(in_srgb,var(--primary)_60%,transparent)]",
            )}
          >
            <ToothShape
              tooth={tooth}
              condition={condition}
              isLower={isLower}
              isSelected={isSelected}
              isTreated={isTreated}
            />
          </button>
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-36 p-1"
        align="center"
        onContextMenu={(e) => e.preventDefault()}
      >
        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
          Zub {tooth}
        </p>
        {manualConditions.map((c) => {
          const cs = conditionSvg[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                onToothConditionChange(tooth, c);
                onMenuClose();
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors",
                condition === c && "bg-muted font-semibold",
              )}
            >
              <svg
                width="12"
                height="14"
                viewBox="2 0 16 28"
                className="shrink-0"
              >
                <path
                  d="M4,1 Q10,-0.5 16,1 L17,24 Q17,27 13.5,27 L6.5,27 Q3,27 3,24 Z"
                  fill={cs.fill}
                  stroke={cs.stroke}
                  strokeWidth="1.5"
                  strokeDasharray={c === "missing" ? "3 2" : undefined}
                  opacity={c === "missing" ? "0.5" : "1"}
                />
              </svg>
              {conditionLabel[c]}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
