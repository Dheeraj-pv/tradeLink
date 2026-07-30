import type { JobStatus } from "../types";
import { STAGES } from "../constants";

export function stageIndex(status: JobStatus): number {
  if (status === "ASSIGNED") return 0;
  if (status === "IN_PROGRESS") return 1;
  if (status === "AWAITING_APPROVAL") return 2;
  if (status === "COMPLETED") return 3;
  return 0;
}