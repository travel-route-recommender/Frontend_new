export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "not-found"
  | "conflict"
  | "rate-limited"
  | "server"
  | "aborted";

export type ApiErrorInit = {
  status: number;
  kind: ApiErrorKind;
  message: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly code?: string;
  readonly details?: unknown;

  constructor({ status, kind, message, code, details }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.code = code;
    this.details = details;
  }
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rate-limited";
  return status >= 500 ? "server" : "network";
}

function messageFromPayload(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return typeof payload === "string" && payload.trim() ? payload : fallback;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim()));
    if (messages.length) return messages.join(" · ");
  }
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  return fallback;
}

export function apiErrorFromResponse(response: Response, payload: unknown) {
  const record = isRecord(payload) ? payload : undefined;
  const code = typeof record?.code === "string" ? record.code : undefined;
  const details = record?.details ?? record?.errors ?? payload;
  return new ApiError({
    status: response.status,
    kind: kindFromStatus(response.status),
    message: messageFromPayload(payload, response.statusText || "요청을 처리하지 못했어요."),
    ...(code ? { code } : {}),
    ...(details !== undefined ? { details } : {}),
  });
}

export function normalizeApiFailure(error: unknown) {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError({ status: 0, kind: "aborted", message: "요청이 취소되었어요." });
  }
  const message = error instanceof Error && error.message ? error.message : "서버에 연결할 수 없어요.";
  return new ApiError({ status: 0, kind: "network", message, details: error });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
