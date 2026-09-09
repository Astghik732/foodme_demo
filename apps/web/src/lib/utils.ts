import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmd(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} AMD`;
}

export function translate(list: { lang: string; value: string }[] | undefined, lang = "en"): string {
  if (!list) return "";
  const found = list.find((t) => t.lang === lang);
  return found ? found.value : (list[0]?.value ?? "");
}
