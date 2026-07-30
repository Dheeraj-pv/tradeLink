"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "./components/icons";
import { useJobDetail } from "./hooks/useJobDetail";
import { JobHeader } from "./components/JobHeader";
import { ProgressBar } from "./components/ProgressBar";
import { JobInfoGrid } from "./components/JobInfoGrid";
import { ActionButtons } from "./components/ActionButtons";
import { JobStagesSidebar, HelpSidebar } from "./components/Sidebar";

export default function AssignedJobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { job, loading, actioning, updateJobStatus } = useJobDetail(jobId);

  if (loading) {
    return (
      <div className="dash-page">
        <p className="aj-state">Loading job details…</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="dash-page">
      <Link href="/provider/assigned-jobs" className="back-link">
        <ArrowLeftIcon />
        Back to Assigned Jobs
      </Link>

      <div className="aj-layout">
        {/* Job detail card */}
        <div className="aj-card">
          <JobHeader job={job} />

          <div className="aj-card-body">
            <h2 className="aj-job-title">{job.title}</h2>
            <p className="aj-job-desc">{job.description}</p>

            <ProgressBar status={job.status} />
            <JobInfoGrid job={job} />

            <ActionButtons
              status={job.status}
              actioning={actioning}
              onAction={updateJobStatus}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="aj-sidebar">
          <JobStagesSidebar />
          <HelpSidebar />
        </aside>
      </div>

      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--sub);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--text);
        }

        .aj-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }

        /* Card */
        .aj-card {
          background: var(--white);
          border-radius: 14px;
          overflow: hidden;
        }
        .aj-card-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
        }
        .banner-assigned {
          background: #fffbf0;
          border-bottom: 1px solid #f5e9c8;
        }
        .banner-inprogress {
          background: #eef3fd;
          border-bottom: 1px solid #d0dff7;
        }
        .banner-waiting {
          background: #fffbf0;
          border-bottom: 1px solid #f5e9c8;
        }
        .banner-completed {
          background: #edf7f2;
          border-bottom: 1px solid #cfe8d6;
        }
        .aj-banner-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .banner-assigned .aj-banner-status {
          color: #b85c00;
        }
        .banner-inprogress .aj-banner-status {
          color: #3b6fd4;
        }
        .banner-waiting .aj-banner-status {
          color: #b87300;
        }
        .banner-completed .aj-banner-status {
          color: #1f7a42;
        }
        .aj-banner-amount {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--orange);
        }

        .aj-card-body {
          padding: 24px;
        }
        .aj-job-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 10px;
        }
        .aj-job-desc {
          font-size: 0.875rem;
          color: var(--sub);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* Progress bar */
        .progress-wrap {
          display: flex;
          align-items: flex-start;
          margin-bottom: 24px;
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
        .line-navy {
          background: var(--navy);
        }
        .line-amber {
          background: #f5a623;
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
          background: var(--white);
          margin-bottom: 8px;
        }
        .circle-done {
          border-color: var(--navy);
          background: var(--navy);
          color: #fff;
        }
        .circle-active {
          border-color: var(--navy);
          background: var(--white);
        }
        .circle-empty {
          border-color: #d8d2c8;
          background: var(--white);
        }
        .circle-waiting {
          border-color: #f5a623;
          background: var(--white);
          color: #f5a623;
        }
        .progress-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-align: center;
        }
        .label-navy {
          color: var(--navy);
        }
        .label-amber {
          color: #f5a623;
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
        .sub-amber {
          color: #f5a623;
        }

        /* Info grid */
        .aj-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .aj-info-full {
          grid-column: 1 / -1;
        }
        .aj-info-cell {
          background: var(--cream);
          border-radius: 8px;
          padding: 12px 14px;
        }
        .aj-info-label {
          font-size: 0.72rem;
          color: var(--sub);
          margin-bottom: 4px;
        }
        .aj-info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--navy);
        }

        /* Action buttons */
        .btn-action {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .btn-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-start {
          background: #3b3bd4;
          color: #fff;
        }
        .btn-start:hover:not(:disabled) {
          background: #2e2eb8;
        }
        .btn-complete {
          background: var(--navy);
          color: #fff;
        }
        .btn-complete:hover:not(:disabled) {
          background: #253460;
        }
        .btn-dot {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
        }

        .waiting-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fffbf0;
          border: 1.5px solid #f5d98a;
          border-radius: 9px;
          padding: 13px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #b87300;
        }

        /* Sidebar */
        .aj-sidebar {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .aj-sidebar-card {
          background: var(--white);
          border-radius: 12px;
          padding: 20px;
        }
        .aj-sidebar-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 14px;
        }
        .stages-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .stage-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .stage-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
        }
        .dot-amber {
          background: #f5a623;
        }
        .dot-blue {
          background: #3b6fd4;
        }
        .dot-green {
          background: #34a868;
        }
        .stage-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--navy);
          margin-bottom: 2px;
        }
        .stage-sub {
          font-size: 0.75rem;
          color: var(--sub);
        }

        .help-card {
          border: 1.5px solid var(--border);
        }
        .help-text {
          font-size: 0.82rem;
          color: var(--sub);
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .btn-support {
          width: 100%;
          padding: 11px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          background: var(--white);
          color: var(--navy);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .btn-support:hover {
          border-color: var(--navy);
        }

        .aj-state {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 40px 0;
          text-align: center;
        }

        @media (max-width: 900px) {
          .aj-layout {
            grid-template-columns: 1fr;
          }
          .aj-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}