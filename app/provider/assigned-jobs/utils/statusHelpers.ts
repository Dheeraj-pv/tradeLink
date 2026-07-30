import type { Job } from "../types";

export function getBadgeClass(status: Job["status"]): string {
  switch (status) {
    case "ASSIGNED":
      return "badge-assigned";
    case "IN_PROGRESS":
      return "badge-progress";
    case "COMPLETED":
      return "badge-completed";
    case "AWAITING_APPROVAL":
      return "badge-progress";
    default:
      return "badge-assigned";
  }
}
