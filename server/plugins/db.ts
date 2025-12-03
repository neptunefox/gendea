import { dbPromise } from '../db'

export default defineNitroPlugin(async () => {
  await dbPromise
  console.log('[DB] Database initialized')
})
