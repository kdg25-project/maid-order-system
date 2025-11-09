type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

type BaseRequest<M extends Method, B> = {
  endpoint: `/${string}`;
  method: M;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
} & (M extends "GET" ? { body?: never } : { body?: B });

export type EasyFetchResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export class HttpError<E = unknown> extends Error {
  status: number;
  data: E;
  constructor(message: string, status: number, data: E) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

// ===== impl =====
const BASE_URL = "https://api.kdgn.tech";

function buildUrl(path: `/${string}`, query?: Record<string, QueryValue>) {
  const url = new URL(path, BASE_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * easyFetch<T>
 * - T: レスポンス型
 * - M/B は req から推論されるので指定不要
 */
export async function easyFetch<T, M extends Method = "GET", B = unknown>(
  req: BaseRequest<M, B>,
): Promise<EasyFetchResponse<T>> {
  const url = buildUrl(req.endpoint, req.query);

  const hasBody = "body" in req && req.body !== undefined;
  const headers = new Headers({
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...req.headers,
  });

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: hasBody ? JSON.stringify(req.body) : undefined,
  });

  // Content判定
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");
  const isNoContent =
    res.status === 204 ||
    ct === "" ||
    res.headers.get("content-length") === "0";

  // ペイロード取得（JSON優先、ダメならtext、204はundefined）
  let payload: unknown = undefined;
  if (!isNoContent) {
    if (isJson) {
      try {
        payload = await res.json();
      } catch {
        // JSON壊れてたら undefined のままにして下で扱う
      }
    } else {
      payload = await res.text();
    }
  }

  if (!res.ok) {
    // サーバーがエラーJSONを返すケースに備えて、そのまま添付
    throw new HttpError(
      `HTTP ${res.status} ${res.statusText}`,
      res.status,
      payload,
    );
  }

  return { data: payload as T, status: res.status, headers: res.headers };
}
