import type { DashboardJob } from "../types";

export function getBadgeClass(status: DashboardJob["status"]): string {
  switch (status) {
    case "OPEN":
      return "badge-open";
    case "ASSIGNED":
      return "badge-assigned";
    case "IN_PROGRESS":
      return "badge-progress";
    case "COMPLETED":
      return "badge-completed";
    case "CANCELLED":
      return "badge-cancelled";
    default:
      return "badge-open";
  }
}
