import type { JobStatus, BannerConfig } from "./types";

export const STAGES = [
  { key: "ASSIGNED", label: "Assigned", sub: "Provider confirmed" },
  { key: "IN_PROGRESS", label: "In Progress", sub: "Work underway" },
  {
    key: "AWAITING_APPROVAL",
    label: "Awaiting Approval",
    sub: "Awaiting your approval",
  },
  { key: "COMPLETED", label: "Completed", sub: "Customer confirmed" },
] as const;

export const BANNER_CONFIG: Record<JobStatus, BannerConfig> = {
  ASSIGNED: { label: "ASSIGNED", cls: "banner-assigned" },
  IN_PROGRESS: { label: "IN PROGRESS", cls: "banner-inprogress" },
  AWAITING_APPROVAL: {
    label: "AWAITING CUSTOMER APPROVAL",
    cls: "banner-waiting",
  },
  COMPLETED: { label: "COMPLETED", cls: "banner-completed" },
};