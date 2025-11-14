import { easyFetch } from "@/lib/easyFetch";
import type {
  ApiResponse,
  Order,
  OrderState,
  OrdersListResponse,
} from "@/app/types";

// API Functions

/**
 * 注文一覧を取得
 */
export async function getOrders(params?: { state?: OrderState }) {
  return easyFetch<ApiResponse<OrdersListResponse>>({
    endpoint: "/api/orders",
    method: "GET",
    query: params,
  });
}

/**
 * 注文をIDで取得
 */
export async function getOrderById(id: number) {
  return easyFetch<ApiResponse<Order>>({
    endpoint: `/api/orders/${id}`,
    method: "GET",
  });
}

/**
 * ユーザーの注文一覧を取得
 */
export async function getOrdersByUserId(userId: string) {
  return easyFetch<ApiResponse<OrdersListResponse>>({
    endpoint: `/api/orders/users/${userId}`,
    method: "GET",
  });
}

/**
 * 注文を作成
 */
export async function createOrder(data: { user_id: string; menu_id: number }) {
  return easyFetch<
    ApiResponse<Order>,
    "POST",
    { user_id: string; menu_id: number }
  >({
    endpoint: "/api/orders",
    method: "POST",
    body: data,
  });
}

/**
 * 注文ステータスを更新
 */
export async function updateOrderState(id: number, state: OrderState) {
  return easyFetch<ApiResponse<Order>, "PATCH", { state: OrderState }>({
    endpoint: `/api/orders/${id}`,
    method: "PATCH",
    body: { state },
  });
}
