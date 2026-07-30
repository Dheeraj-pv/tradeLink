import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";

export async function GET(): Promise<NextResponse> {
  try {
    const user = (await getCurrentUser())!;

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested unread notification count",
    );

    const prisma = getPrisma();

    const count: number = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    logger.info(
      {
        userId: user.id,
        unreadCount: count,
      },
      "Unread notification count loaded successfully",
    );

    return NextResponse.json({
      unreadCount: count,
    });
  } catch (err: unknown) {
    logger.error(
      {
        err,
      },
      "Failed to load unread notification count",
    );

    return NextResponse.json(
      {
        error: "Failed to load unread notification count",
      },
      {
        status: 500,
      },
    );
  }
}
