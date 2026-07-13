/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: "mock" | "api" | "hybrid";
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DURI_ENGINE?: "local" | "server";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
