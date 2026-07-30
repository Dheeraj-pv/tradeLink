import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as bidRepository from "@/repositories/customer/job-bids.repository";

export async function getJobBids(jobId: string) {
  return withSpan("Get Job Bids", async (span) => {
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        jobId,
      },
      "Fetching bids for job",
    );

    const bids = await withSpan("Load Job Bids", async () => {
      return bidRepository.findJobBids(jobId);
    });

    span.setAttribute("bids.count", bids.length);

    logger.info(
      {
        jobId,
        bidCount: bids.length,
      },
      "Fetched job bids successfully",
    );

    return bids.map((bid) => ({
      id: bid.id,
      amount: Number(bid.amount),
      message: bid.message,
      status: bid.status,
      provider: {
        id: bid.provider.id,
        name: bid.provider.name,
        avgRating: bid.provider.providerDetails?.avgRating ?? 0,
        reviewCount: bid.provider.providerDetails?.reviewCount ?? 0,
        category:
          bid.provider.providerCategories[0]?.category.name ?? "General",
      },
    }));
  });
}
