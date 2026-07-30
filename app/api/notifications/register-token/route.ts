import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { withSpan } from "@/lib/tracing";

export async function POST(req: NextRequest) {
  return withSpan("Register Device Token", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    let token: string;

    try {
      ({ token } = await withSpan("Parse Request", async () => {
        return req.json();
      }));
    } catch {
      span.setAttribute("failure.reason", "invalid_request_body");

      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (!token) {
      span.setAttribute("failure.reason", "missing_token");

      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    console.log("Register token", {
      userId: user.id,
      token,
    });

    const prisma = getPrisma();

    await withSpan("Save Device Token", async () => {
      await prisma.deviceToken.upsert({
        where: { token },
        update: { userId: user.id },
        create: { token, userId: user.id },
      });
    });

    return NextResponse.json({
      success: true,
    });
  });
}
