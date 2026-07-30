import { NextRequest, NextResponse } from "next/server";
import { getProviderJobMedia } from "@/services/provider/provider-job-media.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function getProviderJobMediaController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const media = await getProviderJobMedia(id);

  return NextResponse.json(
    {
      message: "Job media loaded successfully.",
      data: {
        media,
      },
    },
    {
      status: 200,
    },
  );
}