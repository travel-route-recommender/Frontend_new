export type DataSourceMode = "mock" | "api" | "hybrid";
export type DuriEngineMode = "local" | "server";
export type ServerDataModule = "auth" | "users" | "quiz" | "rooms" | "places" | "saves" | "candidates" | "schedule";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";
const dataSourceModes: DataSourceMode[] = ["mock", "api", "hybrid"];
const duriEngineModes: DuriEngineMode[] = ["local", "server"];

function enumValue<Value extends string>(value: string | undefined, allowed: readonly Value[], fallback: Value): Value {
  return allowed.includes(value as Value) ? value as Value : fallback;
}

function baseUrl(value: string | undefined) {
  const normalized = value?.trim().replace(/\/+$/, "");
  return normalized || DEFAULT_API_BASE_URL;
}

export const apiRuntimeConfig = Object.freeze({
  dataSource: enumValue(import.meta.env.VITE_DATA_SOURCE, dataSourceModes, "mock"),
  apiBaseUrl: baseUrl(import.meta.env.VITE_API_BASE_URL),
  duriEngine: enumValue(import.meta.env.VITE_DURI_ENGINE, duriEngineModes, "local"),
});

export function usesServerData(_module: ServerDataModule) {
  return apiRuntimeConfig.dataSource === "api" || apiRuntimeConfig.dataSource === "hybrid";
}

export function usesServerDuriEngine() {
  return apiRuntimeConfig.duriEngine === "server" && apiRuntimeConfig.dataSource !== "mock";
}

export function allowsMockData() {
  return apiRuntimeConfig.dataSource === "mock";
}
