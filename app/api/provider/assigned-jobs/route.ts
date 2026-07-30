import { getAssignedJobsController } from "@/controllers/provider/assigned-jobs.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await getAssignedJobsController();
  } catch (error) {
    return handleApiError(error);
  }
}
