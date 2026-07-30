"use client";
// app/provider/bids/page.tsx

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

function PinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED";
type FilterTab = "ALL" | BidStatus;

type Bid = {
  id: string;
  amount: number;
  status: BidStatus;
  createdAt: string;
  job: { id: string; title: string; address: string; status: string };
};

type Summary = {
  total: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  winRate: number;
  confirmedEarnings: number;
  pendingEarnings: number;
};

const BADGE: Record<BidStatus, { label: string; cls: string }> = {
  PENDING: { label: "PENDING", cls: "bid-badge-pending" },
  ACCEPTED: { label: "ACCEPTED", cls: "bid-badge-accepted" },
  REJECTED: { label: "REJECTED", cls: "bid-badge-rejected" },
};

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("ALL");

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/provider/bids");
      const response = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(response));
        return;
      }
      setBids(response.data.bids);
      setSummary(response.data.summary);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const filteredBids = useMemo(() => {
    if (filter === "ALL") return bids;
    return bids.filter((b) => b.status === filter);
  }, [bids, filter]);

  const tabs: { key: FilterTab; label: string; count: number }[] = summary
    ? [
        { key: "ALL", label: "All", count: summary.total },
        { key: "PENDING", label: "Pending", count: summary.pendingCount },
        { key: "ACCEPTED", label: "Accepted", count: summary.acceptedCount },
        { key: "REJECTED", label: "Rejected", count: summary.rejectedCount },
      ]
    : [];

  return (
    <div className="dash-page">
      {/* Header row with filter tabs */}
      <div className="bids-header">
        <div>
          <h1 className="dash-page-title">My Bids</h1>
          {summary && (
            <p className="dash-page-sub">
              {summary.total} total bid{summary.total !== 1 ? "s" : ""} placed
            </p>
          )}
        </div>
        {tabs.length > 0 && (
          <div className="filter-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`filter-tab ${filter === t.key ? "active" : ""}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label} <span className="filter-count">{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout: bids list + sidebar */}
      <div className="bids-layout">
        {/* LEFT — bid cards */}
        <div className="bids-list-col">
          {loading && <p className="bids-state">Loading your bids…</p>}
          {!loading && filteredBids.length === 0 && (
            <p className="bids-state">No bids found.</p>
          )}
          {!loading &&
            filteredBids.map((bid) => {
              const badge = BADGE[bid.status];
              return (
                <div key={bid.id} className="bid-card">
                  {/* Card header */}
                  <div className="bid-card-top">
                    <div className="bid-card-left">
                      <div className="bid-title-row">
                        <span className="bid-job-title">{bid.job.title}</span>
                        <span className={`bid-badge ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="bid-meta">
                        <span className="bid-meta-item">
                          <PinIcon />
                          {bid.job.address}
                        </span>
                        <span className="bid-meta-item">
                          <ClockIcon />
                          {bid.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="bid-amount-col">
                      <span className="bid-amount">
                        ${bid.amount.toLocaleString()}
                      </span>
                      <span className="bid-rate-label">flat rate</span>
                    </div>
                  </div>

                  {/* Accepted extra row */}
                  {bid.status === "ACCEPTED" && (
                    <div className="bid-accepted-row">
                      <div className="bid-accepted-tag">
                        <CheckIcon />
                        Customer accepted your bid
                      </div>
                      <Link
                        href={`/provider/assigned-jobs/${bid.job.id}`}
                        className="btn-view-assigned"
                      >
                        View Assigned Job
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* RIGHT — sidebar */}
        {summary && (
          <aside className="bids-sidebar">
            {/* Overview */}
            <div className="sidebar-card">
              <p className="sidebar-card-label">OVERVIEW</p>
              <div className="overview-rows">
                <div className="overview-row">
                  <span className="overview-dot dot-pending" />
                  <span className="overview-key">Pending</span>
                  <span className="overview-val val-pending">
                    {summary.pendingCount}
                  </span>
                </div>
                <div className="overview-row">
                  <span className="overview-dot dot-accepted" />
                  <span className="overview-key">Accepted</span>
                  <span className="overview-val val-accepted">
                    {summary.acceptedCount}
                  </span>
                </div>
                <div className="overview-row">
                  <span className="overview-dot dot-rejected" />
                  <span className="overview-key">Rejected</span>
                  <span className="overview-val val-rejected">
                    {summary.rejectedCount}
                  </span>
                </div>
                <div className="overview-divider" />
                <div className="overview-row">
                  <span className="overview-key" style={{ fontWeight: 600 }}>
                    Win rate
                  </span>
                  <span
                    className="overview-val"
                    style={{ fontWeight: 700, color: "var(--text)" }}
                  >
                    {summary.winRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="sidebar-card earnings-card">
              <p
                className="sidebar-card-label"
                style={{ color: "rgba(255,255,255,.5)" }}
              >
                CONFIRMED EARNINGS
              </p>
              <p className="earnings-amount">
                ${summary.confirmedEarnings.toLocaleString()}
              </p>
              <p className="earnings-sub">
                from {summary.acceptedCount} accepted bid
                {summary.acceptedCount !== 1 ? "s" : ""}
              </p>
              <div className="earnings-divider" />
              <p className="earnings-pending-label">Potential pending</p>
              <p className="earnings-pending-amount">
                ${summary.pendingEarnings.toLocaleString()}
              </p>
            </div>

            {/* Quick tip */}
            <div className="sidebar-card tip-card">
              <p className="sidebar-card-label">QUICK TIP</p>
              <p className="tip-text">
                Bids with a personalised message and clear pricing win{" "}
                <strong>40% more often</strong> than generic ones.
              </p>
            </div>
          </aside>
        )}
      </div>

      <style>{`
        .bids-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 999px;
          border: 1.5px solid var(--border); background: var(--white);
          color: var(--sub); font-size: .82rem; font-weight: 600;
          font-family: inherit; cursor: pointer; transition: all .15s;
          white-space: nowrap;
        }
        .filter-tab:hover { border-color: var(--navy); color: var(--navy); }
        .filter-tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }
        .filter-count {
          background: rgba(255,255,255,.2); border-radius: 999px;
          padding: 1px 7px; font-size: .75rem;
        }
        .filter-tab:not(.active) .filter-count {
          background: #eee; color: var(--sub);
        }

        .bids-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }

        /* BID CARDS */
        .bids-list-col { display: flex; flex-direction: column; gap: 12px; }
        .bid-card {
          background: var(--white); border-radius: 12px;
          padding: 20px 22px;
        }
        .bid-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
        }
        .bid-card-left { flex: 1; }
        .bid-title-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 8px; flex-wrap: wrap;
        }
        .bid-job-title { font-size: .9rem; font-weight: 700; color: var(--navy); }
        .bid-badge {
          font-size: .65rem; font-weight: 700; letter-spacing: .05em;
          padding: 3px 9px; border-radius: 999px; border: 1.5px solid;
        }
        .bid-badge-pending  { color: #b85c00; border-color: #e8891a; background: #fff8ee; }
        .bid-badge-accepted { color: #287a52; border-color: #34a868; background: #edf7f2; }
        .bid-badge-rejected { color: #c92e2e; border-color: #e88080; background: #fdecec; }
        .bid-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .bid-meta-item { display: flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--sub); }
        .bid-amount-col { text-align: right; flex-shrink: 0; }
        .bid-amount { display: block; font-size: 1.4rem; font-weight: 800; color: var(--navy); }
        .bid-rate-label { font-size: .72rem; color: var(--sub); }

        .bid-accepted-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; margin-top: 16px; padding-top: 14px;
          border-top: 1px solid #edf7f2; flex-wrap: wrap;
        }
        .bid-accepted-tag {
          display: flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 600; color: #287a52;
        }
        .btn-view-assigned {
          padding: 9px 18px; background: var(--navy); color: #fff;
          border-radius: 8px; font-size: .82rem; font-weight: 600;
          text-decoration: none; transition: background .15s; white-space: nowrap;
        }
        .btn-view-assigned:hover { background: #253460; }

        /* SIDEBAR */
        .bids-sidebar { display: flex; flex-direction: column; gap: 14px; }
        .sidebar-card {
          background: var(--white); border-radius: 12px; padding: 20px;
        }
        .sidebar-card-label {
          font-size: .68rem; font-weight: 700; letter-spacing: .1em;
          color: var(--sub); margin-bottom: 14px; text-transform: uppercase;
        }
        .overview-rows { display: flex; flex-direction: column; gap: 10px; }
        .overview-row { display: flex; align-items: center; gap: 8px; }
        .overview-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dot-pending  { background: #e8891a; }
        .dot-accepted { background: #34a868; }
        .dot-rejected { background: #e05252; }
        .overview-key { flex: 1; font-size: .875rem; color: var(--sub); }
        .overview-val { font-size: .875rem; font-weight: 700; }
        .val-pending  { color: #b85c00; }
        .val-accepted { color: #287a52; }
        .val-rejected { color: #c92e2e; }
        .overview-divider { height: 1px; background: var(--border); margin: 4px 0; }

        .earnings-card { background: var(--navy); }
        .earnings-amount { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .earnings-sub { font-size: .78rem; color: rgba(255,255,255,.5); }
        .earnings-divider { height: 1px; background: rgba(255,255,255,.12); margin: 16px 0; }
        .earnings-pending-label { font-size: .78rem; color: rgba(255,255,255,.5); margin-bottom: 4px; }
        .earnings-pending-amount { font-size: 1.2rem; font-weight: 700; color: #fff; }

        .tip-card { border: 1.5px solid var(--border); background: var(--white); }
        .tip-text { font-size: .82rem; color: var(--sub); line-height: 1.6; }
        .tip-text strong { color: var(--text); }

        .bids-state {
          color: var(--sub); font-size: .9rem;
          padding: 40px 0; text-align: center;
        }
        .bids-error {
          padding: 12px 16px; background: #fdecec;
          border: 1px solid #f3c7c7; color: #c92e2e;
          border-radius: 9px; font-size: .875rem;
        }

        @media (max-width: 900px) {
          .bids-layout { grid-template-columns: 1fr; }
          .bids-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
