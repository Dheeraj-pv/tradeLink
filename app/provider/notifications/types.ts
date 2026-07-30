import type { BaseNotification } from "@/components/ui/notification-components";

export type NotificationType = "JOB_ASSIGNED" | "REVIEW_RECEIVED";

export type Notification = BaseNotification & {
  type: NotificationType;
  title: string;
};

export type NotificationConfig = {
  icon: React.ReactNode;
  iconClass: string;
  navigate: (referenceId: string) => void;
};
