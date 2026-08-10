// controllers/provider/provider-certifications.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  uploadProviderCertification,
  deleteProviderCertification,
} from "@/services/provider/provider-certifications.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions based on what the service actually returns
type CertificationResponse = {
  id: string;
  title: string;
  filePath: string;
};

type UploadCertificationResponse = {
  message: string;
  data: {
    certification: CertificationResponse;
  };
};

type DeleteCertificationResponse = {
  message: string;
};

type DeleteCertificationRequest = {
  id: string;
};

// Validation schema
const deleteCertificationSchema = z.object({
  id: z.string().min(1, "Certification ID is required"),
});

/**
 * Upload Provider Certification Controller
 * Uploads a new certification for the current provider
 */
export async function uploadProviderCertificationController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("UploadProviderCertificationController", async (span) => {
    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      logger.warn("Upload certification: Invalid form data");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const title = formData.get("title") as string | null;
    const image = formData.get("image") as File | null;

    if (!title || !image) {
      logger.warn("Upload certification: Missing title or image", {
        hasTitle: !!title,
        hasImage: !!image,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    logger.info("Upload certification request", {
      title,
      fileSize: image.size,
      fileType: image.type,
    });

    span.setAttribute("certification.title", title);
    span.setAttribute("certification.fileSize", image.size);

    const certification = await uploadProviderCertification(formData);

    logger.info("Certification uploaded successfully", {
      certificationId: certification.id,
      title: certification.title,
    });

    const response: UploadCertificationResponse = {
      message: "Certification uploaded successfully.",
      data: {
        certification,
      },
    };

    return NextResponse.json(response, {
      status: 201,
    });
  });
}

/**
 * Delete Provider Certification Controller
 * Deletes a certification by ID
 */
export async function deleteProviderCertificationController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("DeleteProviderCertificationController", async (span) => {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Delete certification: Invalid request body");
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const parsed = deleteCertificationSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Delete certification: Validation failed", {
        errors: parsed.error.issues,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const validatedData: DeleteCertificationRequest = parsed.data;

    logger.info("Delete certification request", {
      certificationId: validatedData.id,
    });

    span.setAttribute("certification.id", validatedData.id);

    await deleteProviderCertification(validatedData.id);

    logger.info("Certification deleted successfully", {
      certificationId: validatedData.id,
    });

    const response: DeleteCertificationResponse = {
      message: "Certification deleted successfully.",
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}