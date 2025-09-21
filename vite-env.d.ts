/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_XUNFEI_API_KEY: string;
  readonly VITE_XUNFEI_API_SECRET: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
