import { validateEnv } from '../utils/env'

export default defineNitroPlugin(() => {
  try {
    validateEnv()
    console.log('[ENV] Environment variables validated successfully')
  } catch (error) {
    console.error('[ENV] Environment validation failed:', error)
    throw error
  }
})
