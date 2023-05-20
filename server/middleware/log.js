export default defineEventHandler((event) => {
  console.log('Request: ' + event.node.req.url)
})
