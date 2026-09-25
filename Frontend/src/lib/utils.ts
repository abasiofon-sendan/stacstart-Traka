import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Primary call-to-action — mirrors the DESIGN.md button-primary token
 * (flat green, 8px radius, bright hover + soft lift) so one-off CTAs
 * match the shadcn Button exactly.
 */
export const primaryCta =
  "btn-shimmer relative overflow-hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-gradient-to-b from-primary-bright to-primary px-[22px] py-[14px] text-base font-semibold text-white shadow-none transition-all hover:shadow-soft-lift active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

interface ApiErrorBody {
  detail?: unknown;
  message?: string;
}

function extractApiBody(err: unknown): ApiErrorBody | null {
  if (!err || typeof err !== "object" || !("response" in err)) return null;
  const response = (err as { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("data" in response)) return null;
  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  return data as ApiErrorBody;
}

/**
 * Pulls the real message the backend returned (FastAPI `detail` or `message`)
 * instead of axios' generic "Request failed with status code NNN".
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const body = extractApiBody(err);
  if (body) {
    const detail = body.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return null;
        })
        .filter((m): m is string => Boolean(m));
      if (messages.length > 0) return messages.join(" ");
    }
    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
  }
  if (err instanceof Error && err.message && !err.message.includes("status code")) {
    return err.message;
  }
  return fallback;
}
