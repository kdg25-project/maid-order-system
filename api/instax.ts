import { easyFetch } from "@/lib/easyFetch";

// Types
export type Instax = {
  id: number;
  user_id: string;
  maid_id: string;
  image_url: string | null;
  created_at: string;
};

export type InstaxHistory = {
  id: number;
  instax_id: number;
  user_id: string;
  maid_id: string;
  image_url: string;
  archived_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// API Functions

/**
 * InstaxをIDで取得
 */
export async function getInstaxById(id: number, apiKey?: string) {
  return easyFetch<ApiResponse<Instax>>({
    endpoint: `/api/instax/${id}`,
    method: "GET",
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
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
 * ユーザーのInstax履歴を取得（管理者用）
 */
export async function getInstaxHistoryByUserId(
  userId: string,
  apiKey?: string,
) {
  return easyFetch<ApiResponse<InstaxHistory[]>>({
    endpoint: `/api/admin/users/${userId}/instax-history`,
    method: "GET",
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
  });
}

/**
 * Instax履歴を削除(管理者用)
 */
export async function deleteInstaxHistory(id: number, apiKey?: string) {
  return easyFetch<ApiResponse<InstaxHistory>, "DELETE">({
    endpoint: `/api/admin/instax/history/${id}`,
    method: "DELETE",
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
  });
}
