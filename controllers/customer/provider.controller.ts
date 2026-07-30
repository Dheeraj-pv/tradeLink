import { NextRequest, NextResponse } from "next/server";
import { getProviderProfile } from "@/services/customer/provider.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function getProviderProfileController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const profile = await getProviderProfile(id);

  return NextResponse.json(
    {
      message: "Provider profile fetched successfully.",
      data: profile,
    },
    {
      status: 200,
    },
  );
}
