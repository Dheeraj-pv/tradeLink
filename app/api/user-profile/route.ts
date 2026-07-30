import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type CurrentUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
  };
}>;

export async function GET(): Promise<NextResponse> {
  try {
    logger.info("Fetching user details");

    const user = (await getCurrentUser())!;

    const prisma = getPrisma();

    const currentUser: CurrentUser | null = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    logger.info("User details fetched successfully");

    return NextResponse.json(currentUser, {
      status: 200,
    });
  } catch (err: unknown) {
    logger.error(
      {
        err,
      },
      "Failed to fetch categories",
    );

    return NextResponse.json(
      {
        error: "Failed to fetch user details",
      },
      {
        status: 500,
      },
    );
  }
}
