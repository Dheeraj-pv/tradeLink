import type { ReactNode } from "react";
import { TYPE_CONFIG, DEFAULT_CONFIG } from "../constants";
import type { NotificationType } from "../types";

interface Props {
  type: NotificationType;
}

export function NotificationIcon({ type }: Props) {
  const config = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;

  return <div className={`notif-icon ${config.iconClass}`}>{config.icon}</div>;
}
