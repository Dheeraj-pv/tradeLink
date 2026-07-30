import type { JobStatus } from "./types";

export const STATUS_BADGE: Record<string, string> = {
  OPEN: "badge-open",
  ASSIGNED: "badge-assigned",
  COMPLETED: "badge-completed",
  IN_PROGRESS: "badge-assigned",
  AWAITING_APPROVAL: "badge-assigned",
  CANCELLED: "badge-cancelled",
};

export const PROGRESS_STEPS = [
  { label: "Assigned", sub: "Provider confirmed" },
  { label: "In Progress", sub: "Work underway" },
  { label: "Completed", sub: "Job finished" },
];

export const SHOULD_SHOW_PROGRESS = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "AWAITING_APPROVAL",
];
