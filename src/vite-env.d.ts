/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_STREAM_URL: string;
  readonly VITE_JOYSTICK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
