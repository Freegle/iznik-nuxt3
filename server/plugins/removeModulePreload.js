export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // Remove any modulepreload.  These are causing slow LCP because the client spends all its time
    // loading and parsing Javascript it is unlikely ever to need rather than displaying the images
    // and HTML it's rendered on the server.
    // response.body = response.body.replace(
    //   /<link rel="modulepreload"[\s\S]*?>/g,
    //   ''
    // )
  })
})
