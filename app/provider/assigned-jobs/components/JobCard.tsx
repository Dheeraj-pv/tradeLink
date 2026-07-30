import Link from "next/link";
import { CheckCircleIcon, UserIcon, PinIcon, DollarIcon, ChevronRightIcon } from "./icons";
import { getBadgeClass } from "../utils/statusHelpers";
import type { Job } from "../types";

interface Props {
  job: Job;
}

export function JobCard({ job }: Props) {
  return (
    <Link href={`/provider/assigned-jobs/${job.id}`} className="job-card">
      <div className="job-icon">
        <CheckCircleIcon />
      </div>

      <div className="job-info">
        <div className="job-title-row">
          <span className="job-title">{job.title}</span>
          <span className={`job-badge ${getBadgeClass(job.status)}`}>
            {job.status}
          </span>
        </div>

        <div className="job-meta">
          <span className="job-meta-item">
            <UserIcon />
            Customer: {job.customerName}
          </span>

          <span className="job-meta-item">
            <PinIcon />
            {job.address}
          </span>

          {job.agreedAmount !== null && (
            <span className="job-meta-item">
              <DollarIcon />
              Agreed: ${job.agreedAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <span className="job-chevron">
        <ChevronRightIcon />
      </span>
    </Link>
  );
}