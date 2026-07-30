import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as categoryRepository from "@/repositories/category/category.repository";

interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  return withSpan("Fetch Categories", async (span) => {
    logger.info("Fetching categories");

    const categories = await withSpan("Load Categories", async () => {
      return categoryRepository.findAllCategories();
    });

    span.setAttribute("categories.count", categories.length);

    logger.info(
      {
        count: categories.length,
      },
      "Categories fetched successfully",
    );

    return categories;
  });
}