import { env } from "@/env";
export function getApiBaseUrl(): string {
  const urls = {
    prod: env.NEXT_PUBLIC_API_PROD_BASE_URL,
    dev: env.NEXT_PUBLIC_API_DEV_BASE_URL,
    demo: env.NEXT_PUBLIC_API_DEMO_BASE_URL,
  };
  return urls[env.NEXT_PUBLIC_MODE as keyof typeof urls].replace(/\/+$/, "");
}
