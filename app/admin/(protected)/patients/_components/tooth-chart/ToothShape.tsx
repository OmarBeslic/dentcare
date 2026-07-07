import type { ToothCondition } from "@/types";
import { TOOTH_VB, conditionSvg, toothType } from "./constants";

// ── SVG path components ───────────────────────────────────────────────────────

function IncisorPath() {
  return <path d="M4,1 Q10,-0.5 16,1 L17,24 Q17,27 13.5,27 L6.5,27 Q3,27 3,24 Z" />;
}

function CaninePath() {
  return <path d="M10,0 Q15,3 17,7 L17,24 Q17,27 13.5,27 L6.5,27 Q3,27 3,24 L3,7 Q5,3 10,0 Z" />;
}

function PremolarPath() {
  return (
    <>
      <path d="M3,7 Q5.5,1 9,2.5 Q10,7 10,7 Q10,7 11,2.5 Q14.5,1 17,7 L17,24 Q17,27 13.5,27 L6.5,27 Q3,27 3,24 Z" />
      <line x1="10" y1="3" x2="10" y2="10" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
    </>
  );
}

function MolarPath() {
  return (
    <>
      <path d="M1,8 Q3.5,1 7,2 Q9,5 10,5 Q11,5 13,2 Q16.5,1 19,8 L19,24 Q19,27 15,27 L5,27 Q1,27 1,24 Z" />
      <line x1="10"  y1="2.5" x2="10"  y2="11" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
      <line x1="2.5" y1="7"   x2="17.5" y2="7" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
    </>
  );
}

function ImplantPost() {
  return (
    <g opacity="0.7">
      <rect x="8.5" y="18" width="3" height="8" rx="1" fill="white" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5" />
      {[20, 21.5, 23, 24.5].map((y) => (
        <line key={y} x1="8.5" y1={y} x2="11.5" y2={y} stroke="currentColor" strokeWidth="0.4" />
      ))}
    </g>
  );
}

// ── ToothShape ────────────────────────────────────────────────────────────────

interface ToothShapeProps {
  tooth: number;
  condition: ToothCondition;
  isLower: boolean;
  isSelected: boolean;
  isTreated: boolean;
}

export function ToothShape({ tooth, condition, isLower, isSelected, isTreated }: ToothShapeProps) {
  const svg      = conditionSvg[condition];
  const type     = toothType(tooth);
  const isMissing = condition === "missing";

  // Only the PATH group is flipped — the <text> stays unflipped so numbers
  // are always upright (fix for the mirrored-number bug on the lower jaw).
  const pathTransform = isLower ? "scale(1,-1) translate(0,-28)" : undefined;

  const numberFill = isMissing
    ? "#94a3b8"
    : svg.fill === "white" || svg.fill === "none"
    ? "#334155"
    : "white";

  return (
    <svg
      viewBox={TOOTH_VB}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto block"
      style={{ color: svg.stroke, opacity: svg.opacity }}
    >
      <g
        fill={svg.fill}
        stroke={svg.stroke}
        strokeWidth={isSelected ? "1.6" : "1.2"}
        strokeDasharray={isMissing ? "3 2" : undefined}
        transform={pathTransform}
      >
        {type === "incisor"  && <IncisorPath />}
        {type === "canine"   && <CaninePath />}
        {type === "premolar" && <PremolarPath />}
        {type === "molar"    && <MolarPath />}
        {condition === "implant" && <ImplantPost />}
        {isTreated && (
          <circle
            cx="10"
            cy={isLower ? "20" : "8"}
            r="2.2"
            fill="white"
            stroke="var(--primary)"
            strokeWidth="1"
          />
        )}
      </g>

      {/* Number — NOT inside the flipped group; always upright */}
      <text
        x="10"
        y="26"
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize="5.5"
        fontWeight="700"
        fill={numberFill}
      >
        {tooth}
      </text>
    </svg>
  );
}
