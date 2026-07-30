import { NextResponse } from "next/server";
import { getCategories } from "@/services/category/categories.service";

export async function categoriesController() {
  const categories = await getCategories();

  return NextResponse.json(
    {
      message: "Categories fetched successfully.",
      data: categories,
    },
    {
      status: 200,
    },
  );
}
