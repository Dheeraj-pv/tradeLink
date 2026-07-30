import { CheckCircleIcon, ClockIcon } from "./icons";
import { STAGES } from "../constants";
import { stageIndex } from "../utils/stageHelpers";
import type { JobStatus } from "../types";

interface Props {
  status: JobStatus;
}

export function ProgressBar({ status }: Props) {
  const current = stageIndex(status);
  const waiting = status === "AWAITING_APPROVAL";
  const completed = status === "COMPLETED";

  return (
    <div className="progress-wrap">
      {STAGES.map((stage, i) => {
        const done = i < current || (completed && i === current);
        const active = i === current && !completed;

        return (
          <div key={stage.key} className="progress-step">
            {i > 0 && (
              <div
                className={`progress-line ${
                  done
                    ? "line-navy"
                    : active && waiting
                      ? "line-amber"
                      : "line-empty"
                }`}
              />
            )}
            <div
              className={`progress-circle ${
                done
                  ? "circle-done"
                  : active && waiting
                    ? "circle-waiting"
                    : active
                      ? "circle-active"
                      : "circle-empty"
              }`}
            >
              {done ? <CheckCircleIcon size={12} /> : null}
              {active && waiting ? <ClockIcon size={12} /> : null}
            </div>
            <p
              className={`progress-label ${
                done
                  ? "label-navy"
                  : active && waiting
                    ? "label-amber"
                    : active
                      ? "label-navy"
                      : "label-muted"
              }`}
            >
              {stage.label}
            </p>
            <p
              className={`progress-sub ${active && waiting ? "sub-amber" : ""}`}
            >
              {stage.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
