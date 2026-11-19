import { format, parseISO } from "date-fns";

export function prettyDate(value: string): string {
  const day = value.slice(0, 10);
  try {
    return format(parseISO(day), "d MMM yyyy");
  } catch {
    return day;
  }
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function errorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Something went wrong. Try again.";
}
