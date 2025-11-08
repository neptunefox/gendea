export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, northStar, currentStep } = body

  if (!branchId || !northStar) {
    throw createError({
      statusCode: 400,
      message: 'branchId and northStar are required'
    })
  }

  const alternatives = [
    `Break ${currentStep || 'this step'} into smaller micro-actions`,
    `Find a parallel path that achieves the same outcome`,
    `Use existing tools or resources instead of building from scratch`,
    `Partner with someone who has complementary skills`,
    `Test the assumption behind this step before committing`
  ]

  return { alternatives }
})
