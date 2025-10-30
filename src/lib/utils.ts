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
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expiration = new Date(decoded.exp * 1000);

    console.log("Token Debug Info:");
    console.log("- Token ID:", decoded.id);
    console.log("- Username:", decoded.username);
    console.log("- Role:", decoded.role);
    console.log("- Issued at:", new Date(decoded.iat * 1000));
    console.log("- Expires at:", expiration);
    console.log("- Current time:", new Date(currentTime * 1000));
    console.log("- Is expired:", decoded.exp < currentTime);
    console.log(
      "- Time until expiry:",
      Math.floor((decoded.exp - currentTime) / 60),
      "minutes"
    );
  } catch (error) {
    console.error("Error decoding token:", error);
  }
}
