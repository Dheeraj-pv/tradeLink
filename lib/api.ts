// lib/api.ts
import { NextResponse } from "next/server";

export const error = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export const ok = (data: object, status = 200) =>
  NextResponse.json(data, { status });
