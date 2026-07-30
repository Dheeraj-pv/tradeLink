import type { ServerMediaItem } from "@/components/ui/media-components";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
  media: ServerMediaItem[];
};

export type ReviewSummary = {
  total: number;
  avgRating: number;
  breakdown: Record<string, number>;
};
