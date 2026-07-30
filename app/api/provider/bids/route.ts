import { getProviderBidsController } from "@/controllers/provider/provider-bids.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await getProviderBidsController();
  } catch (error) {
    return handleApiError(error);
  }
}
