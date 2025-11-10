import { db } from '../db'
import { archives } from '../../db/schema'

export default defineEventHandler(async () => {
  const allArchives = await db.select().from(archives)

  return { archives: allArchives }
})
