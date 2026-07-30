import { getPrisma } from "@/lib/prisma";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { NotificationType } from "@prisma/client";

interface SendNotificationArgs {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
}

export async function sendNotification({
  userId,
  title,
  message,
  type,
  referenceId,
}: SendNotificationArgs) {
  const prisma = getPrisma();
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, referenceId },
  });

  const deviceTokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });

  if (deviceTokens.length === 0) return notification;

  const response = await getFirebaseMessaging().sendEachForMulticast({
    tokens: deviceTokens.map((d) => d.token),
    notification: { title, body: message },
    data: {
      notificationId: notification.id,
      type,
      ...(referenceId ? { referenceId } : {}),
    },
    webpush: {
      fcmOptions: { link: "/notifications" }, // deep link on click
    },
  });

  console.log("FCM Response:", {
    successCount: response.successCount,
    failureCount: response.failureCount,
    responses: response.responses,
  });

  // Remove tokens FCM says are dead (uninstalled app, revoked permission, etc.)
  const invalidTokens: string[] = [];
  response.responses.forEach((res, idx) => {
    const code = res.error?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      invalidTokens.push(deviceTokens[idx].token);
    }
  });

  if (invalidTokens.length > 0) {
    await prisma.deviceToken.deleteMany({
      where: { token: { in: invalidTokens } },
    });
  }

  return notification;
}
