import { Maid, MaidApiResponse, UpdateMaidActiveRequest } from "@/app/maid/types";

export interface MaidCredentials {
  id: string;
  apiKey: string;
}

const STORAGE_KEY = "maid_auth";
const API_BASE_URL = "https://api.kdgn.tech/api";

const isBrowser = typeof window !== "undefined";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 1 week

const readCookie = (name: string): string | null => {
  if (!isBrowser || typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    if (!cookie) continue;
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return rest.join("=");
    }
  }
  return null;
};

const writeCookie = (name: string, value: string, options?: { maxAgeSeconds?: number }) => {
  if (!isBrowser || typeof document === "undefined") return;
  const attributes = [
    `${name}=${value}`,
    "path=/",
    `max-age=${options?.maxAgeSeconds ?? COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  document.cookie = attributes.join("; ");
};

const deleteCookie = (name: string) => {
  if (!isBrowser || typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export function loadMaidCredentials(): MaidCredentials | null {
  if (!isBrowser) return null;
  try {
    const cookieValue = readCookie(STORAGE_KEY);
    if (!cookieValue) return null;
    const raw = decodeURIComponent(cookieValue);
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
  const encoded = encodeURIComponent(JSON.stringify(credentials));
  writeCookie(STORAGE_KEY, encoded);
}

export function clearMaidCredentials() {
  if (!isBrowser) return;
  deleteCookie(STORAGE_KEY);
}

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export function credentialsFromSearchParams(params: SearchParamsLike): MaidCredentials | null {
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

const buildAuthHeaders = (credentials: MaidCredentials, extra?: HeadersInit): HeadersInit => {
  return {
    "x-api-key": credentials.apiKey,
    ...(extra ?? {}),
  };
};

const apiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

export async function fetchMaidProfile(credentials: MaidCredentials): Promise<Maid | null> {
  const response = await fetch(apiUrl(`/maids/${credentials.id}`), {
    method: "GET",
    headers: buildAuthHeaders(credentials),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`メイド情報の取得に失敗しました (status: ${response.status}).`);
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
    throw new Error(`メイドの初期登録に失敗しました (status: ${response.status}).`);
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function updateMaidProfile(
  credentials: MaidCredentials,
  payload: { name?: string; image?: Blob | File | null }
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
    throw new Error(`メイドプロフィールの更新に失敗しました (status: ${response.status}).`);
  }

  const data: MaidApiResponse = await response.json();
  return data.data;
}

export async function updateMaidActiveStatus(
  credentials: MaidCredentials,
  payload: UpdateMaidActiveRequest
): Promise<Maid> {
  const response = await fetch(apiUrl(`/maids/${credentials.id}/active`), {
    method: "PATCH",
    headers: buildAuthHeaders(credentials, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`稼働状態の更新に失敗しました (status: ${response.status}).`);
  }

  const data: MaidApiResponse = await response.json();
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
