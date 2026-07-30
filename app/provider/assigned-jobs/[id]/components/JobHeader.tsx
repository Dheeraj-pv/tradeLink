import { CheckCircleIcon } from "./icons";
import { BANNER_CONFIG } from "../constants";
import type { Job } from "../types";

interface Props {
  job: Job;
}

export function JobHeader({ job }: Props) {
  const banner = BANNER_CONFIG[job.status];

  return (
    <div className={`aj-card-banner ${banner.cls}`}>
      <div className="aj-banner-status">
        <CheckCircleIcon size={13} />
        {banner.label}
      </div>
      {job.agreedAmount !== null && (
        <span className="aj-banner-amount">
          ${job.agreedAmount.toLocaleString()} agreed
        </span>
      )}
    </div>
  );
}