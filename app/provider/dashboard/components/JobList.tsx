import { JobCard } from "./JobCard";
import type { Job } from "../types";

interface Props {
  jobs: Job[];
  title?: string;
  emptyMessage?: string;
}

export function JobList({
  jobs,
  title = "Recent Available Jobs",
  emptyMessage = "No jobs available at the moment.",
}: Props) {
  return (
    <>
      <div className="dash-section-header">
        <h2 className="dash-section-title">{title}</h2>
        <span className="job-count">{jobs.length} jobs</span>
      </div>

      {jobs.length === 0 ? (
        <p className="pd-state">{emptyMessage}</p>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}
