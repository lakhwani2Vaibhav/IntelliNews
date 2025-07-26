import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function rewriteSourceUrl(url: string): string {
  if (!url) return '#';
  try {
    const urlObject = new URL(url);
    urlObject.searchParams.set('utm_source', 'intellinews.co.in');
    urlObject.searchParams.set('utm_medium', 'referral');
    urlObject.searchParams.delete('utm_campaign'); // Optionally remove campaign
    return urlObject.toString();
  } catch (error) {
    console.error("Invalid URL:", url);
    return url; // Return original URL if parsing fails
  }
}
