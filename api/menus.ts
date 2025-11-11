import { easyFetch } from "@/lib/easyFetch";
import { loadMaidCredentials } from "@/lib/maid-auth";

// Helper function to get API key from cookie
function getApiKey(providedKey?: string): string | undefined {
  if (providedKey) return providedKey;
  const credentials = loadMaidCredentials();
  return credentials?.apiKey;
}

// Types
export type Menu = {
  id: number;
  name: string;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type MenusListResponse = {
  menus: Menu[];
};

// API Functions

/**
 * メニュー一覧を取得
 */
export async function getMenus(params?: { available_only?: boolean }) {
  return easyFetch<ApiResponse<MenusListResponse>>({
    endpoint: "/api/menus",
    method: "GET",
    query: params,
  });
}

/**
 * メニューをIDで取得
 */
export async function getMenuById(id: number) {
  return easyFetch<ApiResponse<Menu>>({
    endpoint: `/api/menus/${id}`,
    method: "GET",
  });
}

/**
 * メニューを更新(JSON)
 */
export async function updateMenu(
  id: number,
  data: { name?: string; stock?: number },
  apiKey?: string,
) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<Menu>, "PATCH", { name?: string; stock?: number }>({
    endpoint: `/api/menus/${id}`,
    method: "PATCH",
    body: data,
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * メニューを削除
 */
export async function deleteMenu(id: number, apiKey?: string) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<Menu>, "DELETE">({
    endpoint: `/api/menus/${id}`,
    method: "DELETE",
    headers: key ? { "x-api-key": key } : undefined,
  });
}
