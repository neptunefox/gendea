export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId } = body

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'branchId is required'
    })
  }

  await $fetch('/api/workflow/transition', {
    method: 'POST',
    body: {
      branchId,
      event: { type: 'PLAN_MISSED' }
    }
  })

  return { success: true }
})
