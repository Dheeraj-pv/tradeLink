"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBids } from "./hooks/useBids";
import { BidsList } from "./components/BidsList";
import { SortSelect } from "./components/SortSelect";

export default function BidsPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const { sortedBids, loading, sortBy, setSortBy, acceptBid } = useBids(jobId);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="loading-state">Loading bids...</div>
      </div>
    );
  }

  // Get job title from first bid or use fallback
  const jobTitle = sortedBids.length > 0 ? "Fix leaking bathroom sink" : "Job";

  return (
    <div className="dash-page">
      <Link href={`/customer/dashboard/jobs/${jobId}`} className="back-link">
        ← Back to Job Details
      </Link>

      <div className="header">
        <div>
          <h1>Bids Received</h1>
          <p>For: {jobTitle}</p>
        </div>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <BidsList bids={sortedBids} jobId={jobId} onAccept={acceptBid} />

      <style>{`
        .loading-state {
          padding: 40px;
          text-align: center;
          color: var(--sub);
        }
        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--sub);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .header h1 {
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .header p {
          font-size: .9rem;
          color: var(--sub);
        }
        .header select {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .header select:focus {
          outline: none;
          border-color: var(--navy);
        }
        .back-link {
          display: inline-flex;
          margin-bottom: 18px;
          font-size: .85rem;
          color: var(--sub);
          text-decoration: none;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--text);
        }
        .bid-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bid-card {
          background: white;
          padding: 20px;
          border-radius: 14px;
          position: relative;
          transition: box-shadow 0.15s;
        }
        .bid-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .lowest {
          display: inline-flex;
          padding: 5px 12px;
          background: #e9f9ef;
          color: #159947;
          font-size: .75rem;
          font-weight: 600;
          border-radius: 999px;
          margin-bottom: 18px;
        }
        .top {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--navy);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
          font-size: 0.9rem;
        }
        .provider {
          flex: 1;
        }
        .name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .name-row h3 {
          font-size: 1.15rem;
          margin: 0;
        }
        .name-row span {
          padding: 4px 10px;
          background: #f3efe8;
          border-radius: 999px;
          font-size: .75rem;
          color: var(--sub);
        }
        .provider p {
          font-size: .85rem;
          color: var(--sub);
          margin-bottom: 10px;
        }
        .message {
          font-size: .92rem;
          line-height: 1.7;
          color: var(--text);
        }
        .price {
          text-align: right;
          min-width: 100px;
        }
        .price h2 {
          font-size: 2rem;
          color: var(--navy);
          margin: 0;
        }
        .price span {
          font-size: .8rem;
          color: var(--sub);
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
        }
        .profile {
          padding: 10px 18px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: white;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .profile:hover {
          border-color: var(--navy);
        }
        .accept {
          padding: 10px 20px;
          background: var(--navy);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .accept:hover {
          background: #253460;
        }
        @media (max-width: 900px) {
          .top {
            flex-direction: column;
          }
          .price {
            text-align: left;
            min-width: unset;
          }
          .actions {
            justify-content: flex-start;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
