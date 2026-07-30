import { ReviewCard } from "./ReviewCard";
import type { Review } from "../types";
import type { ServerMediaItem } from "@/components/ui/media-components";

interface Props {
  reviews: Review[];
  onMediaSelect: (media: ServerMediaItem) => void;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  onMediaSelect,
  emptyMessage = "No reviews yet.",
}: Props) {
  if (reviews.length === 0) {
    return <p className="rv-state">{emptyMessage}</p>;
  }

  return (
    <div className="rv-list">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onMediaSelect={onMediaSelect}
        />
      ))}
    </div>
  );
}
