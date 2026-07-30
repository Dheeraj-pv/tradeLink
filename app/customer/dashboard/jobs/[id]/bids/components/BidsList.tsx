import { BidCard } from "./BidCard";
import type { Bid } from "../types";

interface Props {
  bids: Bid[];
  jobId: string;
  onAccept: (bidId: string) => void;
  emptyMessage?: string;
}

export function BidsList({
  bids,
  jobId,
  onAccept,
  emptyMessage = "No bids received yet.",
}: Props) {
  if (bids.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="bid-list">
      {bids.map((bid, index) => (
        <BidCard
          key={bid.id}
          bid={bid}
          jobId={jobId}
          isLowest={index === 0}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
}
