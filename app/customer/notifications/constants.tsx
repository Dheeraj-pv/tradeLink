import type { ReactNode } from "react";
import {
  BriefcaseIcon,
  DollarIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";
import type { NotificationType } from "./types";

export const TYPE_CONFIG: Record<
  NotificationType,
  { icon: ReactNode; iconClass: string }
> = {
  BID_RECEIVED: {
    icon: <DollarIcon width={16} height={16} />,
    iconClass: "icon-bid",
  },
  AWAITING_APPROVAL: {
    icon: <BriefcaseIcon width={16} height={16} />,
    iconClass: "icon-awaiting",
  },
};

export const DEFAULT_CONFIG = {
  icon: <CheckCircleIcon width={16} height={16} />,
  iconClass: "icon-completed",
};
