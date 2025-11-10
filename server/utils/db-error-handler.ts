export function handleDatabaseError(error: unknown): never {
  console.error('Database error:', error)

  if (error instanceof Error) {
    if (error.message.includes('connect')) {
      throw createError({
        statusCode: 503,
        message: 'Database connection failed. Please check your DATABASE_URL configuration.'
      })
    }

    if (error.message.includes('unique constraint')) {
      throw createError({
        statusCode: 409,
        message: 'A record with this identifier already exists'
      })
    }

    if (error.message.includes('foreign key')) {
      throw createError({
        statusCode: 400,
        message: 'Referenced record does not exist'
      })
    }

    throw createError({
      statusCode: 500,
      message: `Database error: ${error.message}`
    })
  }

  throw createError({
    statusCode: 500,
    message: 'An unexpected database error occurred'
  })
}
