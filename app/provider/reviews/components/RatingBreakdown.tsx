import { RatingStars } from "@/components/ui/review-components";
import { STAR_RANGES } from "../constants";

interface Props {
  breakdown: Record<string, number>;
  maxBreakdown: number;
}

export function RatingBreakdown({ breakdown, maxBreakdown }: Props) {
  return (
    <div className="rv-sidebar-card">
      <p className="rv-sidebar-label">RATING BREAKDOWN</p>
      <div className="breakdown-rows">
        {STAR_RANGES.map((star) => {
          const count = breakdown[star] ?? 0;
          const percentage =
            maxBreakdown > 0 ? Math.round((count / maxBreakdown) * 100) : 0;

          return (
            <div key={star} className="breakdown-row">
              <span className="breakdown-star">{star}</span>
              <RatingStars rating={1} />
              <div className="breakdown-bar-bg">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="breakdown-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
