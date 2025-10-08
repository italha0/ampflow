import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function truncate(text: string | null | undefined, length = 64) {
	if (!text) return "";
	return text.length > length ? `${text.slice(0, length)}…` : text;
}
