import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { NotificationType } from "../types";

export function navigateToNotification(
  router: AppRouterInstance,
  referenceId: string,
  type: NotificationType,
): void {
  switch (type) {
    case "JOB_ASSIGNED":
      router.push(`/provider/assigned-jobs/${referenceId}`);
      break;
    case "REVIEW_RECEIVED":
      router.push("/provider/reviews");
      break;
    default:
      // Fallback - do nothing or navigate to a default page
      console.warn(`Unknown notification type: ${type}`);
  }
}
