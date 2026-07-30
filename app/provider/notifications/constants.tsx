import type { ReactNode } from "react";
import { BriefcaseIcon, StarIcon } from "@/components/ui/icons";
import { CheckCircleIcon } from "@/components/ui/icons";
import type { NotificationType, NotificationConfig } from "./types";

export const TYPE_CONFIG: Record<
  NotificationType,
  { icon: ReactNode; iconClass: string }
> = {
  JOB_ASSIGNED: {
    icon: <BriefcaseIcon width={16} height={16} />,
    iconClass: "icon-job",
  },
  REVIEW_RECEIVED: {
    icon: <StarIcon width={16} height={16} />,
    iconClass: "icon-review",
  },
};

export const DEFAULT_CONFIG = {
  icon: <CheckCircleIcon width={16} height={16} />,
  iconClass: "icon-completed",
};
