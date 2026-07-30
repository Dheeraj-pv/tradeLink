import { useRouter } from "next/navigation";
import type { Bid } from "../types";
import { getProviderInitials } from "../utils/sortHelpers";

interface Props {
  bid: Bid;
  jobId: string;
  isLowest: boolean;
  onAccept: (bidId: string) => void;
}

export function BidCard({ bid, jobId, isLowest, onAccept }: Props) {
  const router = useRouter();

  const handleViewProfile = (): void => {
    router.push(`/customer/dashboard/jobs/${jobId}/bids/${bid.provider.id}`);
  };

  return (
    <div className="bid-card">
      {isLowest && <div className="lowest">✓ Lowest bid</div>}

      <div className="top">
        <div className="avatar">{getProviderInitials(bid.provider.name)}</div>

        <div className="provider">
          <div className="name-row">
            <h3>{bid.provider.name}</h3>
            <span>{bid.provider.category}</span>
          </div>

          <p>
            ★★★★★ {bid.provider.avgRating.toFixed(1)} (
            {bid.provider.reviewCount} reviews)
          </p>

          {bid.message && <p className="message">{bid.message}</p>}
        </div>

        <div className="price">
          <h2>${bid.amount.toFixed(2)}</h2>
          <span>flat rate</span>
        </div>
      </div>

      <div className="actions">
        <button className="profile" onClick={handleViewProfile}>
          👁 Profile
        </button>
        <button className="accept" onClick={() => onAccept(bid.id)}>
          ✓ Accept
        </button>
      </div>
    </div>
  );
}
