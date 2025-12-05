/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string; // Railway 백엔드 URL (프로덕션 필수)
  readonly VITE_API_BASE?: string; // 하위 호환성을 위한 옵션
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
