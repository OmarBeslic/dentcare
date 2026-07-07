"use client";

import { useRef } from "react";
import { LONG_PRESS_MS } from "./constants";

export function useLongPress(onLongPress: () => void, disabled = false) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  function start() {
    if (disabled) return;
    fired.current = false;
    timer.current = setTimeout(() => {
      fired.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }

  function cancel() {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }

  return {
    fired,
    onPointerDown: start,
    onPointerUp:   cancel,
    onPointerLeave: cancel,
  };
}
