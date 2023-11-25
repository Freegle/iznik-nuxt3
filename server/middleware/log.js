export default defineEventHandler((event) => {
  console.log(event.node.req.method + ' request: ' + event.node.req.url)
})
