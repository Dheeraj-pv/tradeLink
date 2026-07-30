"use client";

import { PageHeader, StatsGrid } from "@/components/ui/page-components";
import { useDashboard } from "./hooks/useDashboard";
import { JobList } from "./components/JobList";
import { Pagination } from "./components/Pagination";
import { getStatCards } from "./utils/statsConfig";

export default function ProviderDashboardPage() {
  const {
    data,
    loading,
    error,
    page,
    setPage,
    fetchDashboard,
    pagination,
    stats,
    provider,
    recentJobs,
  } = useDashboard();

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
        <p className="pd-state" style={{ color: "red" }}>
          Error: {error}
        </p>
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

  // Safe access with optional chaining and fallbacks
  const providerName = provider?.name?.split(" ")[0] || "Provider";
  const statCards = getStatCards(stats);

  // Safe subtitle construction
  const getSubtitle = () => {
    if (!provider) return undefined;
    if (provider.reviewCount > 0) {
      return `${provider.reviewCount} reviews · ${provider.avgRating.toFixed(1)}★ average`;
    }
    return "No reviews yet";
  };

  return (
    <div className="dash-page">
      <PageHeader title={`Welcome, ${providerName}`} subtitle={getSubtitle()} />

      <StatsGrid items={statCards} />

      <JobList jobs={recentJobs} />

      {pagination && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <style>{`
        .pd-state {
          color: var(--sub);
          font-size: .9rem;
          padding: 40px 0;
          text-align: center;
        }
        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px 0;
        }
        .dash-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--navy);
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
          transition: all 0.2s;
        }
        .pagination button:hover:not(:disabled) {
          border-color: var(--navy);
          background: var(--bg-subtle);
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
        .btn-retry:hover {
          background: #253460;
        }
        .job-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
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
          cursor: pointer;
        }
        .job-card:hover {
          border-color: var(--navy);
          background: var(--bg-subtle);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
          flex-wrap: wrap;
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
          flex-wrap: wrap;
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
        @media (max-width: 600px) {
          .job-meta {
            flex-direction: column;
            gap: 4px;
          }
          .job-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
