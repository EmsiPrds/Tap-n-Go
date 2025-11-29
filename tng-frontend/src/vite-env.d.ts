/// <reference types="vite/client" />
/* eslint-disable no-unused-vars */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declare module for .lottie files
declare module '*.lottie' {
  const src: string;
  export default src;
}