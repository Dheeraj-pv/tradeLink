import { RatingStars } from "@/components/ui/review-components";
import {
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import type { Review } from "../types";

interface Props {
  review: Review;
  onMediaSelect: (media: ServerMediaItem) => void;
}

export function ReviewCard({ review, onMediaSelect }: Props) {
  return (
    <div className="rv-card">
      <div className="rv-card-header">
        <div className="rv-author-row">
          <div className="rv-avatar">{review.customerName.charAt(0)}</div>
          <div>
            <p className="rv-name">{review.customerName}</p>
            <p className="rv-date">{review.createdAt}</p>
          </div>
        </div>
        <div className="rv-rating-row">
          <RatingStars rating={review.rating} />
          <span className="rv-rating-num">{review.rating}.0</span>
        </div>
      </div>

      {review.comment && <p className="rv-comment">{review.comment}</p>}

      {review.media.length > 0 && (
        <MediaGallery
          items={review.media}
          onSelect={(index) => onMediaSelect(review.media[index])}
        />
      )}
    </div>
  );
}
