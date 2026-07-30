"use client";

import { useRouter } from "next/navigation";
import { NotificationsList } from "@/components/ui/notification-components";
import { useNotifications } from "./hooks/useNotifications";
import { NotificationIcon } from "./components/NotificationIcon";
import { navigateToNotification } from "./utils/navigation";
import type { Notification } from "./types";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markingAll,
    markOneAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleSelect = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markOneAsRead(notification.id);
    }

    // Navigate based on notification type
    navigateToNotification(router, notification.referenceId, notification.type);
  };

  return (
    <>
      <NotificationsList
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        markingAll={markingAll}
        onMarkAll={markAllAsRead}
        onSelect={handleSelect}
        renderIcon={(notification) => (
          <NotificationIcon type={notification.type} />
        )}
      />

      <style>{`
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
