import { JobStatus, Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as jobRepository from "@/repositories/customer/job.repository";

interface GetCustomerJobsParams {
  page: number;
  limit: number;
  status?: JobStatus;
}

interface CreateJobParams {
  title: string;
  description: string;
  address: string;
  categoryId: number;
}

export async function getCustomerJobs({
  page,
  limit,
  status,
}: GetCustomerJobsParams) {
  return withSpan("Get Customer Jobs", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("page", page);
    span.setAttribute("limit", limit);

    if (status) {
      span.setAttribute("status.filter", status);
    }

    logger.info(
      {
        userId: user.id,
        page,
        limit,
        status,
      },
      "Customer requested jobs list",
    );

    const where: Prisma.JobWhereInput = {
      customerId: user.id,
    };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const jobs = await withSpan("Load Jobs", async () => {
      return jobRepository.findCustomerJobs(where, skip, limit);
    });

    const stats = await withSpan("Load Job Statistics", async () => {
      return jobRepository.countCustomerJobs(user.id, where);
    });

    const totalPages = Math.ceil(stats.totalItems / limit);

    span.setAttribute("jobs.returned", jobs.length);
    span.setAttribute("jobs.total", stats.totalItems);

    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      address: job.address,
      createdAt: job.createdAt,
      bidCount: job._count.bids,
    }));

    logger.info(
      {
        userId: user.id,
        page,
        totalItems: stats.totalItems,
        returnedJobs: formattedJobs.length,
      },
      "Customer jobs loaded successfully",
    );

    return {
      jobs: formattedJobs,
      stats: {
        openJobs: stats.openJobs,
        assignedJobs: stats.assignedJobs,
        completedJobs: stats.completedJobs,
        totalJobs: stats.totalJobs,
        inProgressJobs: stats.inProgressJobs,
      },
      pagination: {
        page,
        limit,
        totalItems: stats.totalItems,
        totalPages,
      },
    };
  });
}

export async function createJob({
  title,
  description,
  address,
  categoryId,
}: CreateJobParams) {
  return withSpan("Create Job", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested job creation",
    );

    const job = await withSpan("Persist Job", async () => {
      return jobRepository.createCustomerJob({
        title,
        description,
        address,
        categoryId,
        customerId: user.id,
      });
    });

    span.setAttribute("job.id", job.id);

    logger.info(
      {
        userId: user.id,
        jobId: job.id,
      },
      "Job created successfully",
    );

    return job;
  });
}
