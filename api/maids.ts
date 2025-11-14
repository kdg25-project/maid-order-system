import { easyFetch } from "@/lib/easyFetch";
import { loadMaidCredentials } from "@/lib/maid-auth";
import type {
  ApiResponse,
  AssignedUsersResponse,
  Maid,
  PaginatedMaidsResponse,
} from "@/app/types";

// Helper function to get API key from cookie
function getApiKey(providedKey?: string): string | undefined {
  if (providedKey) return providedKey;
  const credentials = loadMaidCredentials();
  return credentials?.apiKey;
}

// API Functions

/**
 * メイド一覧を取得
 */
export async function getMaids(params?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
}) {
  return easyFetch<PaginatedMaidsResponse>({
    endpoint: "/api/maids",
    method: "GET",
    query: params,
  });
}

/**
 * メイドをIDで取得
 */
export async function getMaidById(id: string) {
  return easyFetch<ApiResponse<Maid>>({
    endpoint: `/api/maids/${id}`,
    method: "GET",
  });
}

/**
 * メイドを作成
 */
export async function createMaid(
  id: string,
  data?: { is_instax_available?: boolean },
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<
    ApiResponse<Maid>,
    "POST",
    { is_instax_available?: boolean }
  >({
    endpoint: `/api/maids/${id}`,
    method: "POST",
    body: data,
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * メイドを更新(JSON)
 */
export async function updateMaid(
  id: string,
  data: { name?: string; is_instax_available?: boolean },
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<
    ApiResponse<Maid>,
    "PATCH",
    { name?: string; is_instax_available?: boolean }
  >({
    endpoint: `/api/maids/${id}`,
    method: "PATCH",
    body: data,
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * メイドを削除
 */
export async function deleteMaid(id: string, apiKey?: string) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<Maid>, "DELETE">({
    endpoint: `/api/maids/${id}`,
    method: "DELETE",
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * メイドのアクティブステータスを切り替え
 */
export async function toggleMaidActive(
  id: string,
  is_active: boolean,
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<Maid>, "PATCH", { is_active: boolean }>({
    endpoint: `/api/maids/${id}/active`,
    method: "PATCH",
    body: { is_active },
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * メイドに割り当てられたユーザーを取得
 */
export async function getMaidAssignedUsers(
  id: string,
  params?: { status?: "serving" | "leaving" | "both" },
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<AssignedUsersResponse>>({
    endpoint: `/api/maids/${id}/users`,
    method: "GET",
    query: params,
    headers: key ? { "x-api-key": key } : undefined,
  });
}
