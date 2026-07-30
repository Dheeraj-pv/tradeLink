import { SHOULD_SHOW_PROGRESS } from "../constants";
import type { JobStatus } from "../types";

export function currentStageIndex(status: string): number {
  if (status === "ASSIGNED") return 0;
  if (status === "IN_PROGRESS" || status === "AWAITING_APPROVAL") return 1;
  if (status === "COMPLETED") return 2;
  return -1;
}

export function shouldShowProgress(status: string): boolean {
  return SHOULD_SHOW_PROGRESS.includes(status);
}

export function getProviderInitial(name?: string): string {
  return (name ?? "P").charAt(0).toUpperCase();
}
