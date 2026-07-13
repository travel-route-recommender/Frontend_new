import { apiErrorFromResponse, normalizeApiFailure, type ApiError } from "./apiError";

export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type ApiRequestOptions = {
  query?: QueryParams;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  accessToken?: string;
};

type ApiClientOptions = {
  baseUrl: string;
  credentials?: RequestCredentials;
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  onUnauthorized?: (error: ApiError) => void | Promise<void>;
};

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  const isJson = response.headers.get("content-type")?.toLocaleLowerCase().includes("json");
  if (!isJson) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly credentials: RequestCredentials;
  private readonly getAccessToken?: ApiClientOptions["getAccessToken"];
  private readonly onUnauthorized?: ApiClientOptions["onUnauthorized"];

  constructor({ baseUrl, credentials = "same-origin", getAccessToken, onUnauthorized }: ApiClientOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.credentials = credentials;
    this.getAccessToken = getAccessToken;
    this.onUnauthorized = onUnauthorized;
  }

  get<ResponseBody>(path: string, options?: ApiRequestOptions) {
    return this.request<ResponseBody>("GET", path, undefined, options);
  }

  post<ResponseBody, RequestBody = unknown>(path: string, body?: RequestBody, options?: ApiRequestOptions) {
    return this.request<ResponseBody>("POST", path, body, options);
  }

  put<ResponseBody, RequestBody = unknown>(path: string, body?: RequestBody, options?: ApiRequestOptions) {
    return this.request<ResponseBody>("PUT", path, body, options);
  }

  patch<ResponseBody, RequestBody = unknown>(path: string, body?: RequestBody, options?: ApiRequestOptions) {
    return this.request<ResponseBody>("PATCH", path, body, options);
  }

  delete<ResponseBody>(path: string, options?: ApiRequestOptions) {
    return this.request<ResponseBody>("DELETE", path, undefined, options);
  }

  private buildUrl(path: string, query?: QueryParams) {
    const rawUrl = /^https?:\/\//i.test(path)
      ? path
      : `${this.baseUrl}/${path.replace(/^\/+/, "")}`;
    const url = new URL(rawUrl, window.location.origin);
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const values = Array.isArray(value) ? value : [value];
      values.forEach((entry) => url.searchParams.append(key, String(entry)));
    });
    return url.toString();
  }

  private async request<ResponseBody>(method: string, path: string, body?: unknown, options: ApiRequestOptions = {}) {
    try {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");
      if (body !== undefined) headers.set("Content-Type", "application/json");
      const accessToken = options.accessToken ?? await this.getAccessToken?.();
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const response = await fetch(this.buildUrl(path, options.query), {
        method,
        headers,
        signal: options.signal,
        credentials: options.credentials ?? this.credentials,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const payload = await parseResponse(response);
      if (response.ok) return payload as ResponseBody;

      const apiError = apiErrorFromResponse(response, payload);
      if (apiError.kind === "unauthorized" && this.onUnauthorized) {
        try {
          await this.onUnauthorized(apiError);
        } catch {
          // 인증 계약 확인 전에는 토큰 갱신이나 재요청을 수행하지 않는다.
        }
      }
      throw apiError;
    } catch (error) {
      throw normalizeApiFailure(error);
    }
  }
}
