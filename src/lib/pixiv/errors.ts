import type { ApiErrorShape } from "@/types/pixiv";

export class PixivClientError extends Error {
  code?: string;
  cause?: unknown;

  constructor(error: ApiErrorShape) {
    super(error.message);
    this.name = "PixivClientError";
    this.code = error.code;
    this.cause = error.cause;
  }
}

export function toPixivError(error: unknown, fallback = "Pixiv API への接続に失敗しました。") {
  if (error instanceof PixivClientError) return error;
  if (error instanceof Error) {
    return new PixivClientError({ message: error.message || fallback, cause: error });
  }
  return new PixivClientError({ message: fallback, cause: error });
}
