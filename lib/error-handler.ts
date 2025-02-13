export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  // Handle Mongoose validation errors
  if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
    return {
      error: 'Validation failed',
      details: error.message,
      status: 400,
    };
  }

  // Handle MongoDB duplicate key errors
  if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
    return {
      error: 'Duplicate entry',
      details: 'A record with this information already exists',
      status: 409,
    };
  }

  // Default error response
  console.error('Unhandled error:', error);
  return {
    error: 'Internal server error',
    status: 500,
  };
}

export function validateRequest<T>(data: unknown, schema: any): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }
}