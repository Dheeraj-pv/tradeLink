"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-components";

export type BaseNotification = {
  id: string;
  message: string;
  type: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsList<T extends BaseNotification>({
  notifications,
  unreadCount,
  loading,
  markingAll,
  onMarkAll,
  onSelect,
  renderIcon,
}: {
  notifications: T[];
  unreadCount: number;
  loading: boolean;
  markingAll: boolean;
  onMarkAll: () => void;
  onSelect: (notification: T) => void;
  renderIcon: (notification: T) => ReactNode;
}) {
  return (
    <div className="dash-page">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 ? (
            <button
              className="btn-mark-all"
              onClick={onMarkAll}
              disabled={markingAll}
            >
              {markingAll ? "Marking…" : "Mark all as read"}
            </button>
          ) : null
        }
      />

      {loading && <p className="notif-state">Loading notifications…</p>}

      {!loading && notifications.length === 0 && (
        <p className="notif-state">You have no notifications yet.</p>
      )}

      {!loading && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notif-card ${notification.isRead ? "" : "unread"}`}
              onClick={() => onSelect(notification)}
            >
              {renderIcon(notification)}
              <div className="notif-body">
                <p className="notif-message">{notification.message}</p>
                <p className="notif-date">{notification.createdAt}</p>
              </div>
              {!notification.isRead && <span className="notif-dot" />}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .btn-mark-all {
          padding: 8px 16px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          background: var(--white);
          color: var(--text);
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .btn-mark-all:hover:not(:disabled) {
          border-color: var(--navy);
          background: #f9f7f4;
        }
        .btn-mark-all:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 700px;
        }
        .notif-card {
          background: var(--white);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border: 1.5px solid transparent;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
          cursor: pointer;
        }
        .notif-card.unread {
          border-color: #f0c9a8;
        }
        .notif-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          border-color: #e8d7c6;
        }
        .notif-body {
          flex: 1;
        }
        .notif-message {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1.5;
          margin-bottom: 4px;
        }
        .notif-date {
          font-size: 0.78rem;
          color: var(--sub);
        }
        .notif-dot {
          width: 8px;
          height: 8px;
          background: var(--orange);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }
        .notif-state {
          color: var(--sub);
          font-size: 0.9rem;
          padding: 40px 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
