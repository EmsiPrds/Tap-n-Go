// Temporary type declarations until @types packages are installed
// These will be replaced once npm install is run

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface Request extends IncomingMessage {
    body?: any;
    params?: any;
    query?: any;
    cookies?: any;
    header?(name: string): string | undefined;
  }
  
  export interface Response extends ServerResponse {
    json(body: any): Response;
    send(body?: any): Response;
    status(code: number): Response;
    setHeader(name: string, value: string): void;
    cookie(name: string, value: string, options?: any): void;
    clearCookie(name: string, options?: any): void;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface Router {
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
    use(...handlers: any[]): Router;
  }
  
  export interface Application {
    use(...handlers: any[]): Application;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
    listen(port: number, callback?: () => void): void;
  }
  
  interface ExpressStatic {
    (): Application;
    json: (options?: any) => any;
    urlencoded: (options?: any) => any;
    Router: () => Router;
  }
  
  const express: ExpressStatic;
  export default express;
  export function Router(): Router;
}

declare module 'cors' {
  export interface CorsOptions {
    origin?: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    credentials?: boolean;
    methods?: string[];
    allowedHeaders?: string[];
  }
  
  function cors(options?: CorsOptions): any;
  export default cors;
  export { CorsOptions };
}

declare module 'cookie-parser' {
  function cookieParser(secret?: string): any;
  export default cookieParser;
}

