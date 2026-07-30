import type { Summary } from "../types";

interface Props {
  summary: Summary | null;
}

export function EarningsCard({ summary }: Props) {
  return (
    <div className="sidebar-card earnings-card">
      <p className="sidebar-title">ACTIVE EARNINGS</p>
      <h2>${summary?.totalEarnings ?? 0}</h2>
      <p>
        across {summary?.activeCount ?? 0} job
        {summary?.activeCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
