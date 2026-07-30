import {
  MediaGallery,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { RatingStars } from "@/components/ui/review-components";
import type { Review } from "../types";

interface Props {
  reviews: Review[];
  onMediaSelect: (media: ServerMediaItem) => void;
}

export function ReviewsList({ reviews, onMediaSelect }: Props) {
  if (reviews.length === 0) {
    return (
      <section>
        <h2>Recent Reviews</h2>
        <p>No reviews yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Recent Reviews</h2>
      <div className="reviews">
        {reviews.map((review, index) => (
          <div key={review.id ?? index} className="review-card">
            <div className="review-header">
              <strong>{review.name}</strong>
              <RatingStars rating={review.rating} gap={2} />
            </div>
            <p>{review.comment}</p>
            {review.media.length > 0 && (
              <MediaGallery
                items={review.media}
                onSelect={(mediaIndex) =>
                  onMediaSelect(review.media[mediaIndex])
                }
                size={100}
                rounded={8}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
