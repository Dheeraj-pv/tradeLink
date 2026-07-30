import { NextRequest } from "next/server";
import {
  uploadProviderCertificationController,
  deleteProviderCertificationController,
} from "@/controllers/provider/provider-certifications.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await uploadProviderCertificationController(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await deleteProviderCertificationController(req);
  } catch (error) {
    return handleApiError(error);
  }
}