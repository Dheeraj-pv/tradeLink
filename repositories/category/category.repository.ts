import { getPrisma } from "@/lib/prisma";

export async function findAllCategories() {
  return getPrisma().category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
