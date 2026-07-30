import { categoriesController } from "@/controllers/category/categories.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await categoriesController();
  } catch (error) {
    return handleApiError(error);
  }
}