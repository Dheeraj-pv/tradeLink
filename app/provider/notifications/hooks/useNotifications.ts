import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";
import type { Notification } from "../types";

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markingAll: boolean;
  fetchNotifications: () => Promise<void>;
  markOneAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (!res.ok) {
        toast.error(getUserFriendlyErrorMessage(data));
        return;
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
      setUnreadCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0,
      );
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const markOneAsRead = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch {
        // Rollback on error
        await fetchNotifications();
      }
    },
    [fetchNotifications],
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    setMarkingAll(true);

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // Rollback on error
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markingAll,
    fetchNotifications,
    markOneAsRead,
    markAllAsRead,
  };
}
