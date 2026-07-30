import { NextResponse } from "next/server";
import { getAssignedJobs } from "@/services/provider/assigned-jobs.service";

export async function getAssignedJobsController() {
  const data = await getAssignedJobs();

  return NextResponse.json(
    {
      message: "Assigned jobs loaded successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}