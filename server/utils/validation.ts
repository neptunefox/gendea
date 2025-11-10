export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw createError({
      statusCode: 400,
      message: `${fieldName} is required`
    })
  }
}

export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    throw createError({
      statusCode: 400,
      message: `${fieldName} must be a valid UUID`
    })
  }
}

export function validateEmail(value: string, fieldName: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    throw createError({
      statusCode: 400,
      message: `${fieldName} must be a valid email address`
    })
  }
}

export function validateNumber(
  value: unknown,
  fieldName: string,
  options?: { min?: number; max?: number }
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw createError({
      statusCode: 400,
      message: `${fieldName} must be a number`
    })
  }

  if (options?.min !== undefined && value < options.min) {
    throw createError({
      statusCode: 400,
      message: `${fieldName} must be at least ${options.min}`
    })
  }

  if (options?.max !== undefined && value > options.max) {
    throw createError({
      statusCode: 400,
      message: `${fieldName} must be at most ${options.max}`
    })
  }
}
