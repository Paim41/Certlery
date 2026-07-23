interface CloudflareEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  CERTIFICATE_FILES: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: {
          format: string;
          quality: number;
        }): Promise<{ response(): Response }>;
      };
    };
  };
}

declare namespace Cloudflare {
  interface Env extends CloudflareEnv {}
}
