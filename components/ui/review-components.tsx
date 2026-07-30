"use client";

import { useState } from "react";

export function RatingStars({
  rating,
  gap = 2,
  filledColor = "#f5a623",
}: {
  rating: number;
  gap?: number;
  filledColor?: string;
}) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((index) => (
        <svg
          key={index}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={index <= Math.round(rating) ? filledColor : "none"}
          stroke={filledColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <style jsx>{`
        .star-row {
          display: flex;
          gap: ${gap}px;
        }
      `}</style>
    </div>
  );
}

export function RatingInputStars({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          className={`star-btn ${index <= (hover || rating) ? "star-filled" : "star-empty"}`}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(index)}
          aria-label={`Rate ${index} out of 5`}
        >
          ★
        </button>
      ))}
      <span className="star-count">{rating}/5</span>
      <style jsx>{`
        .star-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.8rem;
          line-height: 1;
          padding: 0 2px;
          transition: transform 0.1s;
        }
        .star-btn:hover {
          transform: scale(1.15);
        }
        .star-filled {
          color: #f5a623;
        }
        .star-empty {
          color: #d8d2c8;
        }
        .star-count {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--sub);
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
}
