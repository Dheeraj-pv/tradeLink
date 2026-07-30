"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircleIcon } from "@/components/ui/icons";
import {
  MediaGallery,
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { RatingStars } from "@/components/ui/review-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
  media: ServerMediaItem[];
};

type Summary = {
  total: number;
  avgRating: number;
  breakdown: Record<string, number>;
};

const CUSTOMER_SAYS = [
  "Professional & punctual",
  "Great communication",
  "Quality workmanship",
  "Fair pricing",
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<ServerMediaItem | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/provider/reviews");
      const response = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }

      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setSummary(response.data.summary ?? null);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReviews();
  }, [fetchReviews]);

  const maxBreakdown = summary
    ? Math.max(...Object.values(summary.breakdown ?? {}), 1)
    : 1;

  return (
    <div className="dash-page">
      <h1 className="dash-page-title">Reviews</h1>
      {summary ? (
        <p className="dash-page-sub">
          {summary.total} review{summary.total !== 1 ? "s" : ""} received
        </p>
      ) : null}

      {loading ? <p className="rv-state">Loading reviews…</p> : null}

      {!loading ? (
        <div className="rv-layout">
          <div className="rv-list">
            {reviews.length === 0 ? <p className="rv-state">No reviews yet.</p> : null}
            {reviews.map((review) => (
              <div key={review.id} className="rv-card">
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
                {review.comment ? <p className="rv-comment">{review.comment}</p> : null}
                {review.media.length > 0 ? (
                  <MediaGallery
                    items={review.media}
                    onSelect={(index) => setPreviewMedia(review.media[index])}
                  />
                ) : null}
              </div>
            ))}
          </div>

          {summary ? (
            <aside className="rv-sidebar">
              <div className="rv-sidebar-card avg-card">
                <p className="rv-avg-num">{summary.avgRating.toFixed(1)}</p>
                <div className="avg-stars">
                  <RatingStars rating={summary.avgRating} gap={4} />
                </div>
                <p className="rv-avg-total">{summary.total} reviews</p>
              </div>

              <div className="rv-sidebar-card">
                <p className="rv-sidebar-label">RATING BREAKDOWN</p>
                <div className="breakdown-rows">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.breakdown[star] ?? 0;
                    const pct = Math.round((count / maxBreakdown) * 100);

                    return (
                      <div key={star} className="breakdown-row">
                        <span className="breakdown-star">{star}</span>
                        <RatingStars rating={1} />
                        <div className="breakdown-bar-bg">
                          <div
                            className="breakdown-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="breakdown-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rv-sidebar-card">
                <p className="rv-sidebar-label">WHAT CUSTOMERS SAY</p>
                <div className="says-list">
                  {CUSTOMER_SAYS.map((item) => (
                    <div key={item} className="says-row">
                      <CheckCircleIcon width={16} height={16} />
                      <span className="says-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}

      {previewMedia ? (
        <MediaPreviewModal
          src={previewMedia.url}
          type={previewMedia.mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewMedia(null)}
          zIndex={9999}
        />
      ) : null}

      <style jsx>{`
        .rv-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }
        .rv-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rv-card {
          background: var(--white);
          border-radius: 14px;
          padding: 22px 24px;
        }
        .rv-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .rv-author-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rv-avatar {
          width: 36px;
          height: 36px;
          background: #e8e3dc;
          color: var(--text);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .rv-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 2px;
        }
        .rv-date {
          font-size: 0.75rem;
          color: var(--sub);
        }
        .rv-rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .rv-rating-num {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--navy);
        }
        .rv-comment {
          font-size: 0.875rem;
          color: var(--sub);
          line-height: 1.65;
          margin-bottom: 12px;
        }
        .rv-sidebar {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rv-sidebar-card {
          background: var(--white);
          border-radius: 12px;
          padding: 20px;
        }
        .rv-sidebar-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 14px;
        }
        .avg-card {
          background: var(--navy);
          text-align: center;
          padding: 28px 20px;
        }
        .avg-stars {
          display: flex;
          justify-content: center;
        }
        .rv-avg-num {
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          margin-bottom: 10px;
        }
        .rv-avg-total {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 8px;
        }
        .breakdown-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .breakdown-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .breakdown-star {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--sub);
          width: 10px;
          text-align: right;
        }
        .breakdown-bar-bg {
          flex: 1;
          height: 6px;
          background: #ede8e0;
          border-radius: 999px;
          overflow: hidden;
        }
        .breakdown-bar-fill {
          height: 100%;
          background: #f5a623;
          border-radius: 999px;
          transition: width 0.4s ease;
        }
        .breakdown-count {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--sub);
          width: 14px;
          text-align: right;
        }
        .says-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .says-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .says-text {
          font-size: 0.85rem;
          color: var(--navy);
          font-weight: 500;
        }
        .rv-state {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 40px 0;
          text-align: center;
        }
        @media (max-width: 900px) {
          .rv-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
