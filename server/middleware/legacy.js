export default defineEventHandler((event) => {
  if (
    event.node.req.url.indexOf('/sw.js') === 0 ||
    event.node.req.url.indexOf('/robots.txt') === 0
  ) {
    console.log('Return 404 for: ' + event.node.req.url)
    setResponseStatus(event, 404)
  } else if (event.node.req.url.indexOf('/api/') === 0) {
    // This is a request to the /api endpoint which was wrongly used by older clients.  Return a maintenance response
    // code which should stop them retrying.
    console.log('Bounce old API request')
    return {
      ret: 111,
      status:
        'Please update your app from the app store, or do a Ctrl+Shift+R to force a refresh of the site.',
    }
  }
})
