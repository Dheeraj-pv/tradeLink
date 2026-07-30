// app/api/dashboard/customer/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ok, error } from "@/lib/api";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// GET — fetch all notifications for the logged-in customer
export async function GET() {
  return withSpan("Get Customer Notifications", async (span) => {
    try {
      const user = await withSpan("Authenticate User", async () => {
        return (await getCurrentUser())!;
      });

      span.setAttribute("user.id", user.id);

      const prisma = getPrisma();

      logger.info(
        {
          userId: user.id,
        },
        "Customer requested notifications",
      );

      const notifications = await withSpan("Load Notifications", async () => {
        return prisma.notification.findMany({
          where: {
            userId: user.id,
            isRead: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            isRead: true,
            referenceId: true,
            createdAt: true,
          },
        });
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      span.setAttribute("notifications.count", notifications.length);
      span.setAttribute("notifications.unread_count", unreadCount);

      logger.info(
        {
          userId: user.id,
          totalNotifications: notifications.length,
          unreadCount,
        },
        "Customer notifications loaded successfully",
      );

      return NextResponse.json({
        notifications: notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString().split("T")[0],
        })),
        unreadCount,
      });
    } catch (err) {
      logger.error(
        {
          err,
        },
        "Failed to load customer notifications",
      );

      return error("Failed to load notifications", 500);
    }
  });
}

// PATCH — mark one or all notifications as read
// Body: { id: string }  → marks one
// Body: { all: true }   → marks all
export async function PATCH(req: NextRequest) {
  return withSpan("Update Customer Notifications", async (span) => {
    try {
      const user = await withSpan("Authenticate User", async () => {
        return (await getCurrentUser())!;
      });

      span.setAttribute("user.id", user.id);

      let body: unknown;

      try {
        body = await withSpan("Parse Request", async () => {
          return req.json();
        });
      } catch {
        span.setAttribute("failure.reason", "invalid_request_body");

        logger.warn(
          {
            userId: user.id,
          },
          "Invalid notification update request body",
        );

        return error("Invalid request body", 400);
      }

      const prisma = getPrisma();

      if ((body as any).all === true) {
        logger.info(
          {
            userId: user.id,
          },
          "Customer requested mark all notifications as read",
        );

        const result = await withSpan(
          "Mark All Notifications Read",
          async () => {
            return prisma.notification.updateMany({
              where: {
                userId: user.id,
                isRead: false,
              },
              data: {
                isRead: true,
              },
            });
          },
        );

        span.setAttribute("notifications.updated_count", result.count);

        logger.info(
          {
            userId: user.id,
            updatedCount: result.count,
          },
          "All notifications marked as read",
        );

        return NextResponse.json({
          success: true,
        });
      }

      if (typeof (body as any).id === "string") {
        const notificationId = (body as any).id;

        span.setAttribute("notification.id", notificationId);

        logger.info(
          {
            userId: user.id,
            notificationId,
          },
          "Customer requested mark notification as read",
        );

        const notif = await withSpan("Load Notification", async () => {
          return prisma.notification.findUnique({
            where: {
              id: notificationId,
            },
            select: {
              userId: true,
            },
          });
        });

        if (!notif || notif.userId !== user.id) {
          span.setAttribute("failure.reason", "notification_not_found");

          logger.warn(
            {
              userId: user.id,
              notificationId,
            },
            "Notification not found or unauthorized access",
          );

          return error("Not found", 404);
        }

        await withSpan("Mark Notification Read", async () => {
          await prisma.notification.update({
            where: {
              id: notificationId,
            },
            data: {
              isRead: true,
            },
          });
        });

        logger.info(
          {
            userId: user.id,
            notificationId,
          },
          "Notification marked as read",
        );

        return NextResponse.json({
          success: true,
        });
      }

      span.setAttribute("failure.reason", "invalid_action");

      logger.warn(
        {
          userId: user.id,
          body,
        },
        "Invalid notification update request",
      );

      return error("Provide id or all:true", 400);
    } catch (err) {
      logger.error(
        {
          err,
        },
        "Failed to update customer notification",
      );

      return error("Failed to update notification", 500);
    }
  });
}
