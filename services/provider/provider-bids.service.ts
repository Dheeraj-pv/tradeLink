// services/provider/provider-bids.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerBidsRepository from "@/repositories/provider/provider-bids.repository";

export async function getProviderBids() {
  return withSpan("Get Provider Bid History", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider requested bid history",
    );

    const bids = await withSpan("Load Bids", async () => {
      return providerBidsRepository.findProviderBids(user.id);
    });

    const pending = bids.filter(
      (bid) => bid.status === "PENDING",
    );

    const accepted = bids.filter(
      (bid) => bid.status === "ACCEPTED",
    );

    const rejected = bids.filter(
      (bid) => bid.status === "REJECTED",
    );

    const totalBids = bids.length;

    const winRate =
      totalBids > 0
        ? Math.round((accepted.length / totalBids) * 100)
        : 0;

    const confirmedEarnings = accepted.reduce(
      (sum, bid) => sum + Number(bid.amount),
      0,
    );

    const pendingEarnings = pending.reduce(
      (sum, bid) => sum + Number(bid.amount),
      0,
    );

    span.setAttribute("bids.total", totalBids);
    span.setAttribute("bids.pending", pending.length);
    span.setAttribute("bids.accepted", accepted.length);
    span.setAttribute("bids.rejected", rejected.length);
    span.setAttribute("bids.win_rate", winRate);
    span.setAttribute(
      "bids.confirmed_earnings",
      confirmedEarnings,
    );
    span.setAttribute(
      "bids.pending_earnings",
      pendingEarnings,
    );

    logger.info(
      {
        userId: user.id,
        totalBids,
        pendingCount: pending.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
        winRate,
      },
      "Provider bid history loaded successfully",
    );

    return {
      bids: bids.map((bid) => ({
        id: bid.id,
        amount: Number(bid.amount),
        status: bid.status,
        createdAt: bid.createdAt
          .toISOString()
          .split("T")[0],
        job: {
          id: bid.job.id,
          title: bid.job.title,
          address: bid.job.address,
          status: bid.job.status,
        },
      })),
      summary: {
        total: totalBids,
        pendingCount: pending.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
        winRate,
        confirmedEarnings,
        pendingEarnings,
      },
    };
  });
}