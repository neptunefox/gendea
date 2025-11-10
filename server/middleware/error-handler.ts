export default defineEventHandler(event => {
  event.node.res.on('error', error => {
    console.error('[Server Error]', error)
  })
})
