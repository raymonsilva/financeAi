export interface ApiErrorPayload {
  message?: string;
  error?: Array<{ message?: string }>;
}

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getApiErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== "object") return fallback;

  const data = payload as ApiErrorPayload;

  if (typeof data.message === "string" && data.message.length > 0) {
    return data.message;
  }

  if (Array.isArray(data.error) && data.error[0]?.message) {
    return data.error[0].message;
  }

  return fallback;
};
