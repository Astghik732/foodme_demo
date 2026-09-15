export function safeAuthNext(raw: string | null): string {
  if (!raw || raw === "/" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/orders";
  }
  return raw;
}
