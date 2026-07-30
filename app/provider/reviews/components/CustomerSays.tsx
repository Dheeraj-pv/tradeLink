import { CheckCircleIcon } from "@/components/ui/icons";
import { CUSTOMER_SAYS } from "../constants";

export function CustomerSays() {
  return (
    <div className="rv-sidebar-card">
      <p className="rv-sidebar-label">WHAT CUSTOMERS SAY</p>
      <div className="says-list">
        {CUSTOMER_SAYS.map((item) => (
          <div key={item} className="says-row">
            <CheckCircleIcon width={16} height={16} />
            <span className="says-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
