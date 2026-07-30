import { CheckCircleIcon, ClockIcon } from "./icons";
import type { JobStatus } from "../types";

interface Props {
  status: JobStatus;
  actioning: boolean;
  onAction: (action: "start" | "complete") => void;
}

export function ActionButtons({ status, actioning, onAction }: Props) {
  if (status === "ASSIGNED") {
    return (
      <button
        className="btn-action btn-start"
        disabled={actioning}
        onClick={() => onAction("start")}
      >
        <span className="btn-dot" />
        {actioning ? "Starting…" : "Start Work"}
      </button>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <button
        className="btn-action btn-complete"
        disabled={actioning}
        onClick={() => onAction("complete")}
      >
        <CheckCircleIcon size={15} />
        {actioning ? "Sending…" : "Mark as Complete"}
      </button>
    );
  }

  if (status === "AWAITING_APPROVAL") {
    return (
      <div className="waiting-notice">
        <ClockIcon size={15} />
        Completion request sent — waiting for customer to confirm.
      </div>
    );
  }

  return null;
}