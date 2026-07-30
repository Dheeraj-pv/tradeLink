// services/provider/assigned-jobs.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as assignedJobsRepository from "@/repositories/provider/assigned-jobs.repository";

export async function getAssignedJobs() {
  return withSpan("Get Assigned Jobs", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider requested assigned jobs",
    );

    const jobs = await withSpan("Load Assigned Jobs", async () => {
      return assignedJobsRepository.findAssignedJobs(user.id);
    });

    const totalEarnings = jobs.reduce((sum, job) => {
      const bid = job.bids[0];

      return sum + (bid ? Number(bid.amount) : 0);
    }, 0);

    span.setAttribute("jobs.count", jobs.length);
    span.setAttribute("jobs.total_earnings", totalEarnings);

    logger.info(
      {
        userId: user.id,
        jobCount: jobs.length,
        totalEarnings,
      },
      "Assigned jobs loaded successfully",
    );

    return {
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        address: job.address,
        status: job.status,
        category: job.category.name,
        customerName: job.customer.name,
        agreedAmount: job.bids[0] ? Number(job.bids[0].amount) : null,
      })),
      summary: {
        activeCount: jobs.length,
        totalEarnings,
      },
    };
  });
}
