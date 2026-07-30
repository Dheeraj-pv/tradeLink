import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { NotificationType } from "../types";

export function navigateToNotification(
  router: AppRouterInstance,
  referenceId: string,
  type: NotificationType,
): void {
  switch (type) {
    case "BID_RECEIVED":
    case "AWAITING_APPROVAL":
      router.push(`/customer/dashboard/jobs/${referenceId}`);
      break;
    default: {
      // Type-safe exhaustive check
      const _exhaustiveCheck: never = type;
      console.warn(`Unknown notification type: ${_exhaustiveCheck}`);
    }
  }
}
