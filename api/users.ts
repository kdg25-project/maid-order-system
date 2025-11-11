import { easyFetch } from "@/lib/easyFetch";
import { loadMaidCredentials } from "@/lib/maid-auth";
import type { ApiResponse, User } from "@/app/types";

// Helper function to get API key from cookie
function getApiKey(providedKey?: string): string | undefined {
  if (providedKey) return providedKey;
  const credentials = loadMaidCredentials();
  return credentials?.apiKey;
}

// API Functions

/**
 * ユーザーをIDで取得
 */
export async function getUserById(id: string) {
  return easyFetch<ApiResponse<User>>({
    endpoint: `/api/users/${id}`,
    method: "GET",
  });
}

/**
 * 座席IDでユーザーを取得
 */
export async function getUserBySeatId(seatId: number, apiKey?: string) {
  const key = getApiKey(apiKey);
  return easyFetch<ApiResponse<User>>({
    endpoint: `/api/users/seat/${seatId}`,
    method: "GET",
    headers: key ? { "x-api-key": key } : undefined,
  });
}

/**
 * ユーザーを登録(入場登録)
 */
export async function registerUser(
  id: string,
  data: {
    seat_id: number;
    maid_id: string;
    status?: string;
  },
) {
  return easyFetch<
    ApiResponse<User>,
    "POST",
    { seat_id: number; maid_id: string; status?: string }
  >({
    endpoint: `/api/users/${id}`,
    method: "POST",
    body: data,
  });
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  id: string,
  data: {
    name?: string;
    status?: string;
    maid_id?: string;
    instax_maid_id?: string | null;
    seat_id?: number;
    is_valid?: boolean;
  },
) {
  return easyFetch<
    ApiResponse<User>,
    "PATCH",
    {
      name?: string;
      status?: string;
      maid_id?: string;
      instax_maid_id?: string | null;
      seat_id?: number;
      is_valid?: boolean;
    }
  >({
    endpoint: `/api/users/${id}`,
    method: "PATCH",
    body: data,
  });
}
