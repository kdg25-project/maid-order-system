import { easyFetch } from "@/lib/easyFetch";

// Types
export type Maid = {
  id: string;
  name: string;
  image_url: string | null;
  is_instax_available: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedMaidsResponse = {
  success: boolean;
  message: string;
  data: Maid[];
};

export type UserEngagementState = "serving" | "leaving";

export type AssignedUser = {
  id: string;
  name: string | null;
  status: string | null;
  maid_id: string | null;
  instax_maid_id: string | null;
  instax_id: number | null;
  seat_id: number | null;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
  engagement_state: UserEngagementState;
};

export type AssignedUsersResponse = {
  maid_id: string;
  status_filter: "serving" | "leaving" | "both";
  users: AssignedUser[];
};

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
  return easyFetch<ApiResponse<Maid>, "POST", { is_instax_available?: boolean }>({
    endpoint: `/api/maids/${id}`,
    method: "POST",
    body: data,
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
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
  return easyFetch<ApiResponse<Maid>, "PATCH", { name?: string; is_instax_available?: boolean }>({
    endpoint: `/api/maids/${id}`,
    method: "PATCH",
    body: data,
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
  });
}

/**
 * メイドを削除
 */
export async function deleteMaid(id: string, apiKey?: string) {
  return easyFetch<ApiResponse<Maid>, "DELETE">({
    endpoint: `/api/maids/${id}`,
    method: "DELETE",
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
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
  return easyFetch<ApiResponse<Maid>, "PATCH", { is_active: boolean }>({
    endpoint: `/api/maids/${id}/active`,
    method: "PATCH",
    body: { is_active },
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
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
  return easyFetch<ApiResponse<AssignedUsersResponse>>({
    endpoint: `/api/maids/${id}/users`,
    method: "GET",
    query: params,
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
  });
}
