import type { Job } from "../types";

interface Props {
  job: Job;
}

export function JobInfoGrid({ job }: Props) {
  return (
    <div className="aj-info-grid">
      <div className="aj-info-cell">
        <p className="aj-info-label">Customer</p>
        <p className="aj-info-value">{job.customerName}</p>
      </div>
      <div className="aj-info-cell">
        <p className="aj-info-label">Category</p>
        <p className="aj-info-value">{job.category}</p>
      </div>
      <div className="aj-info-cell aj-info-full">
        <p className="aj-info-label">Location</p>
        <p className="aj-info-value">{job.address}</p>
      </div>
    </div>
  );
}
