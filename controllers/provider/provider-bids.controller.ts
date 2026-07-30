import { NextResponse } from "next/server";
import { getProviderBids } from "@/services/provider/provider-bids.service";

export async function getProviderBidsController() {
  const data = await getProviderBids();

  return NextResponse.json(
    {
      message: "Provider bid history loaded successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}