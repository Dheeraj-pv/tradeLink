"use client";

import type { ReactNode } from "react";

export function JobStatusMeta({
  status,
  badgeClass,
  createdAt,
  formatStatus = false,
}: {
  status: string;
  badgeClass: string;
  createdAt: string;
  formatStatus?: boolean;
}) {
  return (
    <div className="detail-meta">
      <span className={`job-badge ${badgeClass}`}>
        {formatStatus ? status.replaceAll("_", " ") : status}
      </span>
      <span className="posted-date">Posted {createdAt}</span>
      <style jsx>{`
        .detail-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .posted-date {
          font-size: 0.82rem;
          color: var(--sub);
        }
      `}</style>
    </div>
  );
}

export function JobInfoGrid({
  items,
}: {
  items: { label: string; value: ReactNode; icon: ReactNode }[];
}) {
  return (
    <div className="detail-info-grid">
      {items.map((item) => (
        <div key={item.label} className="detail-info-card">
          <p className="detail-info-label">
            {item.icon} {item.label}
          </p>
          <p className="detail-info-value">{item.value}</p>
        </div>
      ))}
      <style jsx>{`
        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .detail-info-card {
          background: var(--white);
          border-radius: 11px;
          padding: 16px 18px;
        }
        .detail-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--sub);
          margin-bottom: 6px;
        }
        .detail-info-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }
        @media (max-width: 700px) {
          .detail-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export function JobProgress({
  steps,
  currentIndex,
}: {
  steps: { label: string; sub: string }[];
  currentIndex: number;
}) {
  return (
    <div className="progress-wrap">
      {steps.map((step, index) => {
        const filled = index <= currentIndex;
        return (
          <div key={step.label} className="progress-step">
            {index > 0 && (
              <div
                className={`progress-line ${index <= currentIndex ? "line-filled" : "line-empty"}`}
              />
            )}
            <div
              className={`progress-circle ${filled ? "circle-filled" : "circle-empty"}`}
            >
              {filled ? "✓" : ""}
            </div>
            <p
              className={`progress-label ${filled ? "label-active" : "label-muted"}`}
            >
              {step.label}
            </p>
            <p className="progress-sub">{step.sub}</p>
          </div>
        );
      })}
      <style jsx>{`
        .progress-wrap {
          display: flex;
          align-items: flex-start;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .progress-line {
          position: absolute;
          top: 13px;
          right: 50%;
          width: 100%;
          height: 2px;
          z-index: 0;
        }
        .line-filled {
          background: var(--navy);
        }
        .line-empty {
          background: #d8d2c8;
        }
        .progress-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid;
          z-index: 1;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }
        .circle-filled {
          background: var(--navy);
          border-color: var(--navy);
          color: #fff;
        }
        .circle-empty {
          background: var(--white);
          border-color: #d8d2c8;
          color: transparent;
        }
        .progress-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-align: center;
        }
        .label-active {
          color: var(--navy);
        }
        .label-muted {
          color: #b0a898;
        }
        .progress-sub {
          font-size: 0.7rem;
          color: var(--sub);
          text-align: center;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
