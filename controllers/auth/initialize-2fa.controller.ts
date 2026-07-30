import { NextResponse } from "next/server";
import { initializeTwoFactor } from "@/services/auth/initialize-2fa.service";

export async function initializeTwoFactorController() {
  const data = await initializeTwoFactor();

  return NextResponse.json(
    {
      message: "Two-factor authentication initialized successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}
