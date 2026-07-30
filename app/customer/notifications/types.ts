import type { BaseNotification } from "@/components/ui/notification-components";

export type NotificationType = "BID_RECEIVED" | "AWAITING_APPROVAL";

export type Notification = BaseNotification & {
  type: NotificationType;
  title: string;
};

export type NotificationConfig = {
  icon: React.ReactNode;
  iconClass: string;
  navigate: (referenceId: string) => void;
};
