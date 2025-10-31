import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded: any = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

export function debugToken(token: string): void {
  try {
    jwtDecode(token);
  } catch (error) {}
}
