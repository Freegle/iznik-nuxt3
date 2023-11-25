export default defineEventHandler((event) => {
  console.log('Request: ' + event.node.req.method + ' ' + event.node.req.url)
})
