export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // Remove any modulepreload.  These are causing slow LCP because the client spends all its time
    // loading and parsing Javascript it is unlikely ever to need rather than displaying the images
    // and HTML it's rendered on the server.
    response.body = response.body.replace(
      /<link rel="modulepreload"[\s\S]*?>/g,
      ''
    )

    // Add fetchpriority="high" to entry.css so the browser prioritizes it
    // over other resources. It's the only render-blocking CSS file and needs
    // to complete before first paint.
    response.body = response.body.replace(
      /<link rel="stylesheet" href="([^"]*\/_nuxt\/entry\.[^"]*\.css)"([^>]*)>/,
      '<link rel="stylesheet" href="$1" fetchpriority="high"$2>'
    )

    // Make non-critical component CSS non-render-blocking.
    // Nuxt emits small component CSS as separate <link rel="stylesheet"> tags that
    // block first paint even though they're for below-fold or non-homepage components.
    // Convert them to async loading via media="print" trick, keeping entry.css blocking
    // (it contains critical layout/typography styles).
    response.body = response.body.replace(
      /<link rel="stylesheet" href="([^"]*\/_nuxt\/(?!entry\.)[^"]*\.css)"([^>]*)>/g,
      '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'"$2><noscript><link rel="stylesheet" href="$1"$2></noscript>'
    )
  })
})
