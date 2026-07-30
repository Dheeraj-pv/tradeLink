"use client";

import { useState } from "react";
import {
  MediaPreviewModal,
  type ServerMediaItem,
} from "@/components/ui/media-components";
import { useReviews } from "./hooks/useReviews";
import { ReviewList } from "./components/ReviewList";
import { SummaryCard } from "./components/SummaryCard";
import { RatingBreakdown } from "./components/RatingBreakdown";
import { CustomerSays } from "./components/CustomerSays";

export default function ReviewsPage() {
  const { reviews, summary, loading, maxBreakdown } = useReviews();
  const [previewMedia, setPreviewMedia] = useState<ServerMediaItem | null>(
    null,
  );

  if (loading) {
    return (
      <div className="dash-page">
        <h1 className="dash-page-title">Reviews</h1>
        <p className="rv-state">Loading reviews…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <h1 className="dash-page-title">Reviews</h1>
      {summary && (
        <p className="dash-page-sub">
          {summary.total} review{summary.total !== 1 ? "s" : ""} received
        </p>
      )}

      <div className="rv-layout">
        <ReviewList reviews={reviews} onMediaSelect={setPreviewMedia} />

        {summary && (
          <aside className="rv-sidebar">
            <SummaryCard summary={summary} />
            <RatingBreakdown
              breakdown={summary.breakdown}
              maxBreakdown={maxBreakdown}
            />
            <CustomerSays />
          </aside>
        )}
      </div>

      {previewMedia && (
        <MediaPreviewModal
          src={previewMedia.url}
          type={previewMedia.mediaType === "VIDEO" ? "video" : "image"}
          onClose={() => setPreviewMedia(null)}
          zIndex={9999}
        />
      )}

      <style>{`
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
