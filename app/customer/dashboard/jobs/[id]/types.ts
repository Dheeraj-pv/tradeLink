import type { ServerMediaItem } from "@/components/ui/media-components";

export type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  category: string;
  bidCount: number;
  createdAt: string;
  providerName?: string;
  providerCategory?: string;
  providerId?: string;
};

export type ReviewData = {
  rating: number;
  comment: string;
};

export type JobStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_APPROVAL"
  | "COMPLETED"
  | "CANCELLED";
