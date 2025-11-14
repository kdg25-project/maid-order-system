import {
  Maid,
  MaidApiResponse,
  MaidUsersApiResponse,
  RegisterUserRequest,
  UpdateMaidActiveRequest,
  UpdateUserRequest,
  User,
  UserApiResponse,
  Instax,
  InstaxApiResponse,
} from "@/app/types";

export interface MaidCredentials {
  id: string;
  apiKey: string;
}

const STORAGE_KEY = "maid_auth";
const API_BASE_URL = "https://api.kdgn.tech/api";

const isBrowser = typeof window !== "undefined";

export function loadMaidCredentials(): MaidCredentials | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MaidCredentials;
    if (!parsed.id || !parsed.apiKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMaidCredentials(credentials: MaidCredentials) {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearMaidCredentials() {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
}


export function loadMaidId(): string | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MaidCredentials> | null;
    const id = parsed?.id?.toString().trim();
    return id && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}


export function loadMaidApiKey(): string | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MaidCredentials> | null;
    const key = parsed?.apiKey?.toString().trim();
    return key && key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export function credentialsFromSearchParams(
  params: SearchParamsLike,
): MaidCredentials | null {
  const id = params.get("id")?.trim();
  const key = params.get("key")?.trim();
  if (!id || !key) return null;
  return { id, apiKey: key };
}

const ensureAbsoluteUrl = (target: string) => {
  if (/^https?:\/\//i.test(target)) return target;
  const normalized = target.startsWith("/") ? target : `/${target}`;
  return `https://placeholder.local${normalized}`;
};

export function credentialsFromUrl(raw: string): MaidCredentials | null {
  try {
    const url = new URL(ensureAbsoluteUrl(raw));
    return credentialsFromSearchParams(url.searchParams);
  } catch {
    return null;
  }
}

const buildAuthHeaders = (
  credentials: MaidCredentials,
  extra?: HeadersInit,
): HeadersInit => {
  return {
    "x-api-key": credentials.apiKey,
    ...(extra ?? {}),
  };
};

const apiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

export async function fetchMaidProfile(
  credentials: MaidCredentials,
): Promise<Maid | null> {
  const response = await fetch(apiUrl(`/maids/${credentials.id}`), {
    method: "GET",
    headers: buildAuthHeaders(credentials),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `メイド情報の取得に失敗しました (status: ${response.status}).`,
    );
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function createMaid(credentials: MaidCredentials): Promise<Maid> {
  const response = await fetch(apiUrl(`/maids/${credentials.id}`), {
    method: "POST",
    headers: buildAuthHeaders(credentials),
  });

  if (!response.ok) {
    throw new Error(
      `メイドの初期登録に失敗しました (status: ${response.status}).`,
    );
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function updateMaidProfile(
  credentials: MaidCredentials,
  payload: { name?: string; image?: Blob | File | null },
): Promise<Maid> {
  const formData = new FormData();
  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }
  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await fetch(apiUrl(`/maids/${credentials.id}`), {
    method: "PATCH",
    headers: buildAuthHeaders(credentials),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `メイドプロフィールの更新に失敗しました (status: ${response.status}).`,
    );
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function updateMaidActiveStatus(
  credentials: MaidCredentials,
  payload: UpdateMaidActiveRequest,
): Promise<Maid> {
  const response = await fetch(apiUrl(`/maids/${credentials.id}/active`), {
    method: "PATCH",
    headers: buildAuthHeaders(credentials, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `稼働状態の更新に失敗しました (status: ${response.status}).`,
    );
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function fetchAssignedUsers(
  credentials: MaidCredentials,
  options?: { status?: "serving" | "leaving" | "both" },
): Promise<User[]> {
  const url = new URL(apiUrl(`/maids/${credentials.id}/users`));
  if (options?.status) {
    url.searchParams.set("status", options.status);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildAuthHeaders(credentials),
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `割り当てユーザーの取得に失敗しました (status: ${response.status}).`,
    );
  }

  const data: MaidUsersApiResponse = await response.json();
  return data.data.users;
}

export async function fetchUserBySeat(
  credentials: MaidCredentials,
  seatId: number,
): Promise<User | null> {
  const response = await fetch(apiUrl(`/users/seat/${seatId}`), {
    method: "GET",
    headers: buildAuthHeaders(credentials),
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`席情報からユーザーの取得に失敗しました (status: ${response.status}).`);
  }

  const data: { success: boolean; message: string; data: User } = await response.json();
  return data.data;
}

export async function registerUserEntry(
  credentials: MaidCredentials,
  userId: string,
  payload: RegisterUserRequest,
): Promise<User> {
  const response = await fetch(apiUrl(`/users/${userId}`), {
    method: "POST",
    headers: buildAuthHeaders(credentials, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`ユーザーの登録に失敗しました (status: ${response.status}).`);
  }

  const data: UserApiResponse = await response.json();
  return data.data;
}

export async function postInstaxBySeat(
  credentials: MaidCredentials,
  seatId: number,
  instaxFile: File,
): Promise<Instax> {
  const formData = new FormData()
  formData.append("seat_id", String(seatId))
  formData.append("maid_id", credentials.id)
  formData.append("instax", instaxFile, instaxFile.name || "instax.jpg")

  const response = await fetch(apiUrl(`/instax/by-seat`), {
    method: "POST",
    headers: buildAuthHeaders(credentials),
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`チェキの保存に失敗しました (status: ${response.status}).`)
  }

  const data: InstaxApiResponse = await response.json()
  return data.data
}

export async function updateUserInfo(
  credentials: MaidCredentials,
  userId: string,
  payload: UpdateUserRequest,
): Promise<User> {
  const response = await fetch(apiUrl(`/users/${userId}`), {
    method: "PATCH",
    headers: buildAuthHeaders(credentials, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `ユーザー情報の更新に失敗しました (status: ${response.status}).`,
    );
  }

  const data: UserApiResponse = await response.json();
  return data.data;
}

export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  if (!dataUrl.startsWith("data:")) return null;
  try {
    const [metadata, base64Data] = dataUrl.split(",");
    if (!metadata || !base64Data) return null;
    const mimeMatch = metadata.match(/data:(.*?);base64/);
    const mimeType = mimeMatch?.[1] ?? "image/jpeg";
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mimeType });
  } catch {
    return null;
  }
}
