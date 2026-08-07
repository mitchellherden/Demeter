/// <reference types="vite/client" />

export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_GOOGLE_CLOUD_VISION_API_KEY?: string;
    readonly VITE_GOOGLE_CLOUD_VISION_ENDPOINT?: string;
    readonly VITE_HUGGINGFACE_ENDPOINT?: string;
    readonly VITE_HUGGINGFACE_TOKEN?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
