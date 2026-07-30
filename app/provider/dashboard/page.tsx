"use client";
// app/provider/dashboard/page.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader, StatsGrid } from "@/components/ui/page-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

// ============ ICONS ============
function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CategoryIcon({ category }: { category?: string }) {
  if (!category) return <WrenchIcon />;
  const lower = category.toLowerCase();
  if (lower.includes("plumb") || lower.includes("pipe") || lower.includes("water"))
    return <DropletIcon />;
  if (lower.includes("elect") || lower.includes("wir")) return <ZapIcon />;
  return <WrenchIcon />;
}

// ============ TYPE DEFINITIONS ============
type Job = {
  id: string;
  title: string;
  address: string;
  status: string;
  createdAt: string;
  bidCount: number;
  category?: string;
  customerName?: string;
};

type DashboardData = {
  provider: {
    name: string;
    avgRating: number;
    reviewCount: number;
  };
  stats: {
    openJobs: number;
    assignedJobs: number;
    completedJobs: number;
    totalJobs: number;
    inProgressJobs: number;
  };
  recentJobs: Job[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export default function ProviderDashboardPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 5;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isFirstRender = useRef(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/provider/jobs?page=${page}&limit=${LIMIT}`);
      const json = await res.json();
      
      if (!res.ok) {
        const errorMsg = getUserFriendlyErrorMessage(json);
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      if (!json.data) {
        setError("Invalid response format from server");
        return;
      }
      
      setData(json.data);
      
    } catch {
      const errorMsg = "Network error — please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page, LIMIT]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchDashboard();
    } else {
      fetchDashboard();
    }
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="dash-page">
        <p className="pd-state">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-page">
        <p className="pd-state" style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => fetchDashboard()} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dash-page">
        <p className="pd-state">No data available</p>
      </div>
    );
  }

  const { provider, stats, recentJobs, pagination } = data;
  const safeJobs = Array.isArray(recentJobs) ? recentJobs : [];
  
  const statCards = [
    {
      value: stats?.openJobs ?? 0,
      label: "Available Jobs",
      className: "sc-blue",
    },
    {
      value: stats?.inProgressJobs ?? 0,
      label: "In Progress",
      className: "sc-amber",
    },
    {
      value: stats?.assignedJobs ?? 0,
      label: "Assigned Jobs",
      className: "sc-green",
    },
    {
      value: stats?.completedJobs ?? 0,
      label: "Completed Jobs",
      className: "sc-purple",
    },
  ];

  const providerName = provider?.name?.split(" ")[0] || "Provider";

  return (
    <div className="dash-page">
      <PageHeader
        title={`Welcome, ${providerName}`}
        subtitle={
          provider?.reviewCount > 0
            ? `${provider.reviewCount} reviews · ${provider.avgRating.toFixed(1)}★ average`
            : "No reviews yet"
        }
      />

      <StatsGrid
        items={statCards.map((s) => ({
          value: s.value,
          label: s.label,
          className: s.className,
        }))}
      />
      
      <div className="dash-section-header">
        <h2 className="dash-section-title">Recent Available Jobs</h2>
        <span className="job-count">{safeJobs.length} jobs</span>
      </div>

      {safeJobs.length === 0 ? (
        <p className="pd-state">No jobs available at the moment.</p>
      ) : (
        <div className="job-list">
          {safeJobs.map((job) => (
            <Link
              key={job.id}
              href={`/provider/dashboard/jobs/${job.id}`}
              className="job-card"
            >
              <div className="job-icon">
                <CategoryIcon category={job.category} />
              </div>
              <div className="job-info">
                <div className="job-title-row">
                  <span className="job-title">{job.title}</span>
                  <span className={`job-badge badge-${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
                <div className="job-meta">
                  <span className="job-meta-item">
                    <PinIcon />
                    {job.address}
                  </span>
                  <span className="job-meta-item">
                    <UserIcon />
                    {job.customerName || `${job.bidCount} bid${job.bidCount !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
              <span className="job-chevron">
                <ChevronRightIcon />
              </span>
            </Link>
          ))}
        </div>
      )}
      
      {pagination && pagination.totalPages > 1 ? (
        <div className="pagination">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      ) : null}

      <style>{`
        .pd-state {
          color: var(--sub); font-size: .9rem;
          padding: 40px 0; text-align: center;
        }
        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px 0;
        }
        .job-count {
          font-size: 0.9rem;
          color: var(--sub);
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          margin-top: 24px;
        }
        .pagination button {
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: var(--white);
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
        }
        .pagination button:hover:not(:disabled) {
          border-color: var(--navy);
        }
        .pagination button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .btn-retry {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: var(--navy);
          color: #fff;
          font-size: .85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: block;
          margin: 20px auto;
        }
        .job-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        .job-card:hover {
          border-color: var(--navy);
          background: var(--bg-subtle);
        }
        .job-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-subtle);
          border-radius: 8px;
          color: var(--navy);
        }
        .job-icon svg {
          width: 20px;
          height: 20px;
        }
        .job-info {
          flex: 1;
          min-width: 0;
        }
        .job-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .job-title {
          font-weight: 600;
          font-size: 1rem;
        }
        .job-badge {
          font-size: 0.7rem;
          padding: 2px 10px;
          border-radius: 20px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .badge-open {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .badge-assigned {
          background: #fff3e0;
          color: #e65100;
        }
        .badge-completed {
          background: #e3f2fd;
          color: #0d47a1;
        }
        .badge-in_progress {
          background: #fce4ec;
          color: #c62828;
        }
        .job-meta {
          display: flex;
          gap: 16px;
          font-size: 0.85rem;
          color: var(--sub);
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .job-meta-item svg {
          width: 14px;
          height: 14px;
        }
        .job-chevron {
          flex-shrink: 0;
          color: var(--sub);
        }
      `}</style>
    </div>
  );
}