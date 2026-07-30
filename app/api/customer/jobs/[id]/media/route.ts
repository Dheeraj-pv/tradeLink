import { NextRequest } from "next/server";
import {
  deleteJobMediaController,
  getJobMediaController,
  uploadJobMediaController,
} from "@/controllers/customer/job-media.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    return await uploadJobMediaController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    return await deleteJobMediaController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    return await getJobMediaController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}
