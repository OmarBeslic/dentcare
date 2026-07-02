import { useSession } from "next-auth/react";
import { useCurrentClinic } from "./useCurrentClinic";
import type { AssistantRestrictions } from "@/types";

// Non-assistants always have full view; assistants are gated by their clinic's
// assistantRestrictions, which is the only place this can be configured (per-clinic).
export function useCanView(field: keyof AssistantRestrictions): boolean {
  const { data: session } = useSession();
  const { data: clinic } = useCurrentClinic();

  if (session?.user.role !== "ASSISTANT") return true;

  const restrictions = clinic?.assistantRestrictions ?? {};
  return !restrictions[field];
}
