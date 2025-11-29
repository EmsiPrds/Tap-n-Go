// Global type declarations for Node.js environment
// These declarations allow TypeScript to recognize Node.js globals
// even when @types/node is not yet installed

declare global {
  var process: {
    env: {
      NODE_ENV?: string;
      PORT?: string;
      FRONTEND_URL?: string;
      MONGODB_URI?: string;
      JWT_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      JWT_REFRESH_EXPIRES_IN?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      DEFAULT_ADMIN_USERNAME?: string;
      DEFAULT_ADMIN_PASSWORD?: string;
      [key: string]: string | undefined;
    };
    exit(code?: number): never;
  };
  
  var console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  };
}

export {};

