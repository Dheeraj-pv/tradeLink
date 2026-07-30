"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  StarIcon,
} from "@/components/ui/icons";
import {
  NotificationsList,
  type BaseNotification,
} from "@/components/ui/notification-components";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type NotificationType = "JOB_ASSIGNED" | "REVIEW_RECEIVED";

type Notification = BaseNotification & {
  type: NotificationType;
  title: string;
};

const TYPE_CONFIG: Record<NotificationType, { icon: ReactNode; iconClass: string }> = {
  JOB_ASSIGNED: {
    icon: <BriefcaseIcon width={16} height={16} />,
    iconClass: "icon-job",
  },
  REVIEW_RECEIVED: {
    icon: <StarIcon width={16} height={16} />,
    iconClass: "icon-review",
  },
};

const DEFAULT_CONFIG = {
  icon: <CheckCircleIcon width={16} height={16} />,
  iconClass: "icon-completed",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications();
  }, [fetchNotifications]);

  async function markOneAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setMarkingAll(false);
  }

  function navigateToNotification(referenceId: string, type: NotificationType) {
    switch (type) {
      case "JOB_ASSIGNED":
        router.push(`/provider/assigned-jobs/${referenceId}`);
        break;
      case "REVIEW_RECEIVED":
        router.push("/provider/reviews");
        break;
    }
  }

  return (
    <>
      <NotificationsList
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        markingAll={markingAll}
        onMarkAll={markAllAsRead}
        onSelect={(notification) => {
          if (!notification.isRead) {
            void markOneAsRead(notification.id);
          }
          navigateToNotification(notification.referenceId, notification.type);
        }}
        renderIcon={(notification) => {
          const config = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG;
          return (
            <div className={`notif-icon ${config.iconClass}`}>
              {config.icon}
            </div>
          );
        }}
      />
      <style jsx>{`
        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-job {
          background: #fff8ee;
          color: #b85c00;
        }
        .icon-review {
          background: #f3effe;
          color: #6b3fbd;
        }
        .icon-completed {
          background: #edf7f2;
          color: #287a52;
        }
      `}</style>
    </>
  );
}
