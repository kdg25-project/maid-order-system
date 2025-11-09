export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface GetMaidsQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
}

export interface GetMenusQueryParams {
  available_only?: boolean;
}

export interface Maid {
  id: string;
  name: string;
  image_url: string | null;
  is_instax_available: boolean;
}

export type MaidsApiResponse = ApiResponse<Maid[]>;

export type MaidApiResponse = ApiResponse<Maid>;

export interface CreateMaidRequest {
  is_instax_available?: boolean;
}

export interface UpdateMaidRequest {
  name?: string;
  is_instax_available?: boolean;
}

export interface UpdateMaidActiveRequest {
  is_active: boolean;
}

export interface Menu {
  id: number;
  name: string;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MenusApiResponse = ApiResponse<{
  menus: Menu[];
}>;

export type MenuApiResponse = ApiResponse<Menu>;

export interface UpdateMenuRequest {
  name?: string;
  stock?: number;
}

export interface User {
  id: string;
  name: string | null;
  status: string | null;
  maid_id: string | null;
  instax_maid_id: string | null;
  seat_id: number | null;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export type UserApiResponse = ApiResponse<User>;

export interface RegisterUserRequest {
  seat_id: number;
  maid_id: string;
  status?: string;
}

export interface UpdateUserRequest {
  name?: string | null;
  status?: string | null;
  maid_id?: string | null;
  instax_maid_id?: string | null;
  seat_id?: number | null;
  is_valid?: boolean;
}

export type OrderState = 'pending' | 'preparing' | 'served';

export interface Order {
  id: number;
  user_id: string;
  menu_id: number;
  state: OrderState;
  created_at: string;
  updated_at: string;
}

export type OrdersApiResponse = ApiResponse<{
  orders: Order[];
}>;

export type OrderApiResponse = ApiResponse<Order>;

export interface CreateOrderRequest {
  user_id: string;
  menu_id: number;
}

export interface UpdateOrderStateRequest {
  state: OrderState;
}

export interface Instax {
  id: number;
  user_id: string;
  maid_id: string;
  image_url: string | null;
  created_at: string;
}

export type InstaxApiResponse = ApiResponse<Instax>;

export interface InstaxHistory {
  id: number;
  instax_id: number;
  user_id: string;
  maid_id: string;
  image_url: string;
  archived_at: string;
}

export type InstaxHistoryApiResponse = ApiResponse<InstaxHistory[]>;