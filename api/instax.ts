import { easyFetch } from "@/lib/easyFetch";
import { loadMaidCredentials } from "@/lib/maid-auth";
import type { ApiResponse, Instax, InstaxHistory } from "@/app/types";

// Helper function to get API key from cookie
function getApiKey(providedKey?: string): string | undefined {
  if (providedKey) return providedKey;
  const credentials = loadMaidCredentials();
  return credentials?.apiKey;
}

// API Functions

/**
 * InstaxをIDで取得
 */
export async function getInstaxById(id: number, apiKey?: string) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<Instax>>({
    endpoint: `/api/instax/${id}`,
    method: "GET",
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * ユーザーIDでInstaxを取得
 */
export async function getInstaxByUserId(userId: string) {
  return easyFetch<ApiResponse<Instax>>({
    endpoint: `/api/users/${userId}/instax`,
    method: "GET",
  });
}

/**
 * ユーザーのInstax履歴を取得(管理者用)
 */
export async function getInstaxHistoryByUserId(
  userId: string,
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<InstaxHistory[]>>({
    endpoint: `/api/admin/users/${userId}/instax-history`,
    method: "GET",
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * Instax履歴を削除(管理者用)
 */
export async function deleteInstaxHistory(id: number, apiKey?: string) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<InstaxHistory>, "DELETE">({
    endpoint: `/api/admin/instax/history/${id}`,
    method: "DELETE",
    headers: key ? { "x-api-key": key } : undefined,
  });
}
