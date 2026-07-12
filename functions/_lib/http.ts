import type { ZodType } from "zod";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function json<T>(data: T, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    throw new ApiError(400, "请求体不是有效的 JSON。", error);
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "请求参数校验失败。", error.flatten());
    }

    throw error;
  }
}

export function requireNumericId(rawId: string | undefined): number {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "缺少有效的资源 ID。");
  }

  return id;
}

export function handleError(error: unknown): Response {
  if (error instanceof ApiError) {
    return json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return json(
      {
        error: "请求参数校验失败。",
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  console.error(error);

  return json(
    {
      error: "服务器暂时开了个小差，请稍后再试。",
    },
    { status: 500 },
  );
}
