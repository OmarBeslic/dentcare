import { setHours, setMinutes } from "date-fns";
import { addMinutes } from "./utils";

interface Appointment {
  startTime: Date;
  endTime: Date;
}

interface WorkingDay {
  isActive: boolean;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface Slot {
  time: string;
  available: boolean;
  startTime: string; // ISO
}

function parseHHmm(hhmm: string): { hour: number; min: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hour: h, min: m };
}

export function generateSlots(
  date: Date,
  duration: number,
  workingDay: WorkingDay,
  appointments: Appointment[]
): { slots: Slot[]; offDay: boolean } {
  if (!workingDay.isActive) return { slots: [], offDay: true };

  const { hour: startH, min: startM } = parseHHmm(workingDay.startTime);
  const { hour: endH, min: endM } = parseHHmm(workingDay.endTime);

  const now = new Date();
  const dayEnd = setMinutes(setHours(new Date(date), endH), endM);
  const slots: Slot[] = [];

  // Walk in 30-min increments from work start to work end
  let cursor = setMinutes(setHours(new Date(date), startH), startM);

  while (cursor < dayEnd) {
    const slotEnd = addMinutes(cursor, duration);

    // Skip slot if appointment would run past end of working day
    if (slotEnd > dayEnd) break;

    const isPast = cursor < now;
    const conflict = appointments.some(
      (a) =>
        (cursor >= a.startTime && cursor < a.endTime) ||
        (slotEnd > a.startTime && slotEnd <= a.endTime) ||
        (cursor <= a.startTime && slotEnd >= a.endTime)
    );

    slots.push({
      time: `${String(cursor.getHours()).padStart(2, "0")}:${String(cursor.getMinutes()).padStart(2, "0")}`,
      available: !conflict && !isPast,
      startTime: cursor.toISOString(),
    });

    cursor = addMinutes(cursor, 30);
  }

  return { slots, offDay: false };
}
