import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  uploadProviderCertification,
  deleteProviderCertification,
} from "@/services/provider/provider-certifications.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const deleteCertificationSchema = z.object({
  id: z.string().min(1),
});

export async function uploadProviderCertificationController(req: NextRequest) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const certification = await uploadProviderCertification(formData);

  return NextResponse.json(
    {
      message: "Certification uploaded successfully.",
      data: {
        certification,
      },
    },
    {
      status: 201,
    },
  );
}

export async function deleteProviderCertificationController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = deleteCertificationSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  await deleteProviderCertification(parsed.data.id);

  return NextResponse.json(
    {
      message: "Certification deleted successfully.",
    },
    {
      status: 200,
    },
  );
}
