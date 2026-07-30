import { RatingStars } from "@/components/ui/review-components";
import type { ReviewSummary } from "../types";

interface Props {
  summary: ReviewSummary;
}

export function SummaryCard({ summary }: Props) {
  return (
    <div className="rv-sidebar-card avg-card">
      <p className="rv-avg-num">{summary.avgRating.toFixed(1)}</p>
      <div className="avg-stars">
        <RatingStars rating={summary.avgRating} gap={4} />
      </div>
      <p className="rv-avg-total">{summary.total} reviews</p>
    </div>
  );
}
