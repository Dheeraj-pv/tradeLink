// lib/tracing.ts

import { trace, SpanStatusCode, Span, SpanOptions } from "@opentelemetry/api";

// Export a shared tracer
export const tracer = trace.getTracer("tradelink-api");

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanOptions,
): Promise<T> {
  return tracer.startActiveSpan(name, options ?? {}, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : "Unknown error",
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
