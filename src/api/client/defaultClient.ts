import { apiRuntimeConfig } from "../config";
import { ApiClient } from "./ApiClient";
import type { ApiError } from "./apiError";

export type ApiAuthBindings = {
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  onUnauthorized?: (error: ApiError) => void | Promise<void>;
};

let authBindings: ApiAuthBindings = {};

export function configureApiAuth(bindings: ApiAuthBindings) {
  authBindings = { ...bindings };
}

export function clearApiAuthBindings() {
  authBindings = {};
}

export const apiClient = new ApiClient({
  baseUrl: apiRuntimeConfig.apiBaseUrl,
  getAccessToken: () => authBindings.getAccessToken?.(),
  onUnauthorized: (error) => authBindings.onUnauthorized?.(error),
});
