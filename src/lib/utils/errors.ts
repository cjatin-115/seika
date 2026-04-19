export interface ApiError {
  success: false;
  error: string;
  code: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorResponse = (
  code: string,
  message: string,
  statusCode: number = 400
): ApiError => ({
  success: false,
  error: message,
  code,
});

export const successResponse = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
});

export const handleError = (error: unknown): { statusCode: number; message: string; code: string } => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};
