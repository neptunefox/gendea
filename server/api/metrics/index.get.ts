export default defineEventHandler(async event => {
  const query = getQuery(event)
  const branchId = query.branchId as string | undefined

  const [acquisition, execution, learning, motivation, quality] = await Promise.all([
    $fetch('/api/metrics/acquisition'),
    $fetch('/api/metrics/execution'),
    $fetch('/api/metrics/learning'),
    $fetch('/api/metrics/motivation', { query: branchId ? { branchId } : {} }),
    $fetch('/api/metrics/quality')
  ])

  return {
    acquisition,
    execution,
    learning,
    motivation,
    quality
  }
})
