// Environment configuration
// Vite exposes env variables on the special import.meta.env object
// Variables must be prefixed with VITE_ to be exposed to client-side code

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const UPLOAD_BASE_URL =
  import.meta.env.VITE_UPLOAD_BASE_URL || "http://localhost:5000/Uploads";

// You can add other environment variables here as needed
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
