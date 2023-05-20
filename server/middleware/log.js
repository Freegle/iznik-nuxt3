export default defineEventHandler((event) => {
  console.log(
    'Request: ' +
      event.node.req.socket?.remoteAddress +
      ' - ' +
      event.node.req.url
  )
})
