import { easyFetch } from "@/lib/easyFetch";

// Types
export type OrderState = "pending" | "preparing" | "served";

export type Order = {
  id: number;
  user_id: string;
  menu_id: number;
  state: OrderState;
  created_at: string;
  updated_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type OrdersListResponse = {
  orders: Order[];
};

// API Functions

/**
 * 注文一覧を取得
 */
export async function getOrders() {
  return easyFetch<ApiResponse<OrdersListResponse>>({
    endpoint: "/api/orders",
    method: "GET",
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
  return easyFetch<ApiResponse<Order>, "POST", { user_id: string; menu_id: number }>({
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
